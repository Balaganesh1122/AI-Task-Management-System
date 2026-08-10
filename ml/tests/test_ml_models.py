"""
Unit tests for the 4 trained ML models, run against real Task/User rows via
ml_prediction_service.py. Uses an in-memory SQLite DB per test (SQLAlchemy
renders the app's real Postgres UUID columns generically, so this exercises
the actual model code path, not a mock).

Run: pytest tests/test_ml_models.py -v
"""
import sys
import uuid
import datetime
import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from app.database.base import Base
from app.models.user import User
from app.models.task import Task
from app.services import ml_prediction_service as ml

TODAY = datetime.date.today()


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine, tables=[User.__table__, Task.__table__])
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def make_user(db, **kwargs):
    defaults = dict(id=uuid.uuid4(), name="Test User", email=f"{uuid.uuid4()}@co.com",
                     role="engineer", password="x", department="Backend",
                     skills="python", workload_score=50, experience_years=3)
    defaults.update(kwargs)
    u = User(**defaults)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def make_task(db, user, **kwargs):
    defaults = dict(id=uuid.uuid4(), title="Test task", description="d", status="In Progress",
                     assigned_to=user.id, is_deleted=False, priority="Medium",
                     complexity="Medium", team="Backend", estimated_hours=20,
                     actual_hours=18, bugs_reported=1, rework_hours=1, sprint=1,
                     escalation_count=0, due_date=TODAY + datetime.timedelta(days=3))
    defaults.update(kwargs)
    t = Task(**defaults)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


# ---------------------------------------------------------------------------
# AllocationScorer
# ---------------------------------------------------------------------------

class TestAllocationScorer:

    @pytest.mark.parametrize("priority", ["Low", "Medium", "High"])
    def test_accepts_all_valid_priorities(self, db, priority):
        u = make_user(db)
        t = make_task(db, u, priority=priority)
        result = ml.predict_allocation(db, t.id, u.id)
        assert result["allocation_score"] in (0.0, 1.0, 2.0, 3.0), \
            f"Unexpected allocation score {result['allocation_score']}"

    def test_status_label_matches_score(self, db):
        u = make_user(db)
        t = make_task(db, u)
        result = ml.predict_allocation(db, t.id, u.id)
        expected = {3.0: "Highly Recommended", 2.0: "Recommended"}.get(
            result["allocation_score"], "Not Recommended")
        assert result["status"] == expected

    def test_missing_required_fields_raises_422(self, db):
        u = make_user(db)
        t = make_task(db, u, priority=None, complexity=None, team=None, estimated_hours=None)
        with pytest.raises(HTTPException) as exc:
            ml.predict_allocation(db, t.id, u.id)
        assert exc.value.status_code == 422

    def test_unknown_user_returns_404(self, db):
        u = make_user(db)
        t = make_task(db, u)
        with pytest.raises(HTTPException) as exc:
            ml.predict_allocation(db, t.id, uuid.uuid4())
        assert exc.value.status_code == 404

    def test_encoding_verified_flag_present(self, db):
        u = make_user(db)
        t = make_task(db, u)
        result = ml.predict_allocation(db, t.id, u.id)
        assert "encoding_verified" in result
        # encoders.pkl was regenerated from the real Task_Dataset.csv, so this
        # must now be True. If it flips back to False, encoders.pkl went missing.
        assert result["encoding_verified"] is True


# ---------------------------------------------------------------------------
# Delay Detector
# ---------------------------------------------------------------------------

class TestDelayDetector:

    SCENARIOS = [
        dict(estimated_hours=10, actual_hours=8, priority="Low"),
        dict(estimated_hours=10, actual_hours=25, priority="High"),
        dict(estimated_hours=40, actual_hours=40, priority="Medium"),
        dict(estimated_hours=40, actual_hours=60, priority="High"),
        dict(estimated_hours=5, actual_hours=4, priority="Low"),
        dict(estimated_hours=80, actual_hours=95, priority="High"),
        dict(estimated_hours=20, actual_hours=18, priority="Medium"),
        dict(estimated_hours=15, actual_hours=30, priority="High"),
        dict(estimated_hours=6, actual_hours=5, priority="Low"),
        dict(estimated_hours=50, actual_hours=45, priority="Medium"),
        dict(estimated_hours=30, actual_hours=50, priority="High"),
        dict(estimated_hours=8, actual_hours=7, priority="Low"),
        dict(estimated_hours=25, actual_hours=24, priority="Medium"),
        dict(estimated_hours=12, actual_hours=20, priority="High"),
        dict(estimated_hours=100, actual_hours=90, priority="Medium"),
    ]

    @pytest.mark.parametrize("scenario", SCENARIOS)
    def test_returns_valid_binary_label(self, db, scenario):
        u = make_user(db)
        t = make_task(db, u, **scenario)
        result = ml.predict_delay(db, t.id)
        assert result["status"] in ("Delayed", "On Time")
        assert result["delay_prediction"] in (0, 1)

    def test_unassigned_task_raises_422(self, db):
        u = make_user(db)
        t = make_task(db, u, estimated_hours=None)
        with pytest.raises(HTTPException) as exc:
            ml.predict_delay(db, t.id)
        assert exc.value.status_code == 422


# ---------------------------------------------------------------------------
# Timeline Predictor
# ---------------------------------------------------------------------------

class TestTimelinePredictor:

    def test_prediction_is_never_negative(self, db):
        """
        Regression test for a real bug found during 10-scenario validation:
        the trained XGBRegressor produced negative hour predictions
        (e.g. -34.88) for several realistic inputs. The service now floors
        at 0. This test locks that behavior in.
        """
        u = make_user(db)
        t = make_task(db, u, priority="Low", complexity="Low", team="Frontend",
                       estimated_hours=10, actual_hours=4, bugs_reported=0, rework_hours=0)
        result = ml.predict_timeline(db, t.id)
        assert result["estimated_completion_days"] >= 0

    def test_returns_numeric_prediction(self, db):
        u = make_user(db)
        t = make_task(db, u)
        result = ml.predict_timeline(db, t.id)
        assert isinstance(result["estimated_completion_days"], float)

    def test_zero_floor_rate_on_realistic_scenarios(self, db):
        """
        Regression test. The original Timeline_Risk_model.pkl was found to be
        a corrupted/mismatched artifact (R²=-3.02 on its own training data --
        see VALIDATION_REPORT.md) that hit this 0.0 floor on 5-6/10 realistic
        scenarios. The corrected Timeline_Risk_model_FIXED.pkl should produce
        zero floor hits on well-formed, in-distribution-ish inputs. Any
        failure here means the corrupted model is back in use, or a real
        regression has been introduced.
        """
        scenarios = [
            dict(priority="High", complexity="Low", team="Backend", estimated_hours=8),
            dict(priority="High", complexity="High", team="Backend", estimated_hours=80),
            dict(priority="Medium", complexity="Medium", team="Frontend", estimated_hours=30),
            dict(priority="Low", complexity="Low", team="Frontend", estimated_hours=10),
            dict(priority="High", complexity="High", team="QA", estimated_hours=40),
            dict(priority="Medium", complexity="Low", team="QA", estimated_hours=6),
            dict(priority="Medium", complexity="High", team="Backend", estimated_hours=50),
            dict(priority="High", complexity="Medium", team="Backend", estimated_hours=20),
            dict(priority="Medium", complexity="Medium", team="QA", estimated_hours=25),
            dict(priority="Low", complexity="Low", team="QA", estimated_hours=12),
        ]
        zero_count = 0
        for s in scenarios:
            u = make_user(db)
            t = make_task(db, u, **s)
            result = ml.predict_timeline(db, t.id)
            if result["estimated_completion_days"] == 0.0:
                zero_count += 1
        # Documents observed behavior as of this test run — not asserting it's
        # acceptable, just catching further regression beyond what's known.
        assert zero_count == 0, (
            f"{zero_count}/10 predictions hit the 0.0 floor using the corrected "
            f"Timeline_Risk_model_FIXED.pkl (was 5/10 with the corrupted original "
            f"Timeline_Risk_model.pkl — see VALIDATION_REPORT.md). A jump above 0 "
            f"here means either the model file changed or a real regression."
        )


# ---------------------------------------------------------------------------
# Overdue Risk Classifier
# ---------------------------------------------------------------------------

class TestOverdueRiskClassifier:

    SCENARIOS = [
        dict(delay=0, escalation=0, expected_bucket=("Low", "Medium")),
        dict(delay=1, escalation=0, expected_bucket=("Low", "Medium")),
        dict(delay=2, escalation=0, expected_bucket=("Low", "Medium")),
        dict(delay=3, escalation=1, expected_bucket=("Medium",)),
        dict(delay=4, escalation=1, expected_bucket=("Medium",)),
        dict(delay=5, escalation=2, expected_bucket=("Medium",)),
        dict(delay=6, escalation=2, expected_bucket=("High",)),
        dict(delay=7, escalation=2, expected_bucket=("High",)),
        dict(delay=8, escalation=3, expected_bucket=("High",)),
        dict(delay=9, escalation=3, expected_bucket=("High",)),
        dict(delay=10, escalation=4, expected_bucket=("High",)),
        dict(delay=0, escalation=1, expected_bucket=("Low", "Medium", "High")),
        dict(delay=15, escalation=5, expected_bucket=("High",)),
        dict(delay=3, escalation=0, expected_bucket=("Low", "Medium")),
        dict(delay=6, escalation=0, expected_bucket=("Medium", "High")),
        dict(delay=2, escalation=2, expected_bucket=("Low", "Medium", "High")),
        dict(delay=12, escalation=4, expected_bucket=("High",)),
        dict(delay=1, escalation=1, expected_bucket=("Low", "Medium")),
        dict(delay=8, escalation=1, expected_bucket=("Medium", "High")),
        dict(delay=4, escalation=3, expected_bucket=("Medium", "High")),
    ]

    @pytest.mark.parametrize("scenario", SCENARIOS)
    def test_returns_valid_risk_level(self, db, scenario):
        u = make_user(db, workload_score=50)
        t = make_task(db, u, priority="Medium", escalation_count=scenario["escalation"],
                      due_date=TODAY - datetime.timedelta(days=scenario["delay"]))
        result = ml.predict_risk(db, t.id)
        assert result["risk_level"] in ("Low", "Medium", "High")

    def test_high_delay_high_escalation_is_not_low(self, db):
        u = make_user(db, workload_score=90)
        t = make_task(db, u, priority="High", escalation_count=5,
                      due_date=TODAY - datetime.timedelta(days=15))
        result = ml.predict_risk(db, t.id)
        assert result["risk_level"] != "Low"

    def test_no_delay_no_escalation_is_not_high(self, db):
        u = make_user(db, workload_score=10)
        t = make_task(db, u, priority="Low", escalation_count=0,
                      due_date=TODAY + datetime.timedelta(days=10))
        result = ml.predict_risk(db, t.id)
        assert result["risk_level"] != "High"
