import sys, uuid, datetime
sys.path.insert(0, '.')
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.base import Base
from app.models.user import User
from app.models.task import Task
from app.services import ml_prediction_service as ml

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(bind=engine, tables=[User.__table__, Task.__table__])
Session = sessionmaker(bind=engine)
db = Session()

# 5 employees with varied profiles
employees = [
    User(id=uuid.uuid4(), name="Ganesh", email="ganesh@co.com", role="engineer", password="x",
         department="Backend", skills="python", workload_score=80, experience_years=6),
    User(id=uuid.uuid4(), name="Vaibhav", email="vaibhav@co.com", role="engineer", password="x",
         department="Frontend", skills="react", workload_score=40, experience_years=2),
    User(id=uuid.uuid4(), name="Mike", email="mike@co.com", role="engineer", password="x",
         department="QA", skills="testing", workload_score=95, experience_years=8),
    User(id=uuid.uuid4(), name="Priya", email="priya@co.com", role="engineer", password="x",
         department="Backend", skills="python,go", workload_score=20, experience_years=1),
    User(id=uuid.uuid4(), name="Suresh", email="suresh@co.com", role="engineer", password="x",
         department="QA", skills="automation", workload_score=60, experience_years=4),
]
db.add_all(employees)
db.commit()

today = datetime.date.today()

# 10 varied real-world-shaped task scenarios
scenarios = [
    dict(title="Fix login bug", priority="High", complexity="Low", team="Backend",
         estimated_hours=8, actual_hours=6, bugs_reported=0, rework_hours=0, sprint=4,
         escalation_count=0, due_date=today + datetime.timedelta(days=2), user=0),
    dict(title="Build payment gateway", priority="High", complexity="High", team="Backend",
         estimated_hours=80, actual_hours=95, bugs_reported=6, rework_hours=12, sprint=4,
         escalation_count=2, due_date=today - datetime.timedelta(days=5), user=0),
    dict(title="Redesign dashboard UI", priority="Medium", complexity="Medium", team="Frontend",
         estimated_hours=30, actual_hours=28, bugs_reported=1, rework_hours=2, sprint=4,
         escalation_count=0, due_date=today + datetime.timedelta(days=3), user=1),
    dict(title="Landing page polish", priority="Low", complexity="Low", team="Frontend",
         estimated_hours=10, actual_hours=4, bugs_reported=0, rework_hours=0, sprint=4,
         escalation_count=0, due_date=today + datetime.timedelta(days=7), user=1),
    dict(title="Full regression pass", priority="High", complexity="High", team="QA",
         estimated_hours=40, actual_hours=52, bugs_reported=15, rework_hours=8, sprint=4,
         escalation_count=3, due_date=today - datetime.timedelta(days=8), user=2),
    dict(title="Smoke test new build", priority="Medium", complexity="Low", team="QA",
         estimated_hours=6, actual_hours=5, bugs_reported=0, rework_hours=0, sprint=4,
         escalation_count=0, due_date=today + datetime.timedelta(days=1), user=2),
    dict(title="Refactor auth service", priority="Medium", complexity="High", team="Backend",
         estimated_hours=50, actual_hours=45, bugs_reported=3, rework_hours=5, sprint=4,
         escalation_count=1, due_date=today - datetime.timedelta(days=2), user=3),
    dict(title="Add rate limiting", priority="High", complexity="Medium", team="Backend",
         estimated_hours=20, actual_hours=18, bugs_reported=1, rework_hours=1, sprint=4,
         escalation_count=0, due_date=today + datetime.timedelta(days=4), user=3),
    dict(title="Automate checkout tests", priority="Medium", complexity="Medium", team="QA",
         estimated_hours=25, actual_hours=30, bugs_reported=4, rework_hours=6, sprint=4,
         escalation_count=1, due_date=today - datetime.timedelta(days=1), user=4),
    dict(title="Write API test suite", priority="Low", complexity="Low", team="QA",
         estimated_hours=12, actual_hours=10, bugs_reported=0, rework_hours=1, sprint=4,
         escalation_count=0, due_date=today + datetime.timedelta(days=5), user=4),
]

tasks = []
for s in scenarios:
    u = employees[s.pop("user")]
    t = Task(id=uuid.uuid4(), title=s.pop("title"), description="desc", status="In Progress",
              assigned_to=u.id, is_deleted=False, **s)
    tasks.append((t, u))
    db.add(t)
db.commit()

print(f"{'Task':<26}{'Assignee':<10}{'Alloc':<8}{'Delay':<10}{'Timeline(hrs)':<15}{'Risk':<8}")
print("-" * 80)
for t, u in tasks:
    db.refresh(t)
    alloc = ml.predict_allocation(db, t.id, u.id)
    delay = ml.predict_delay(db, t.id)
    timeline = ml.predict_timeline(db, t.id)
    risk = ml.predict_risk(db, t.id)
    print(f"{t.title[:24]:<26}{u.name:<10}{alloc['allocation_score']:<8}{delay['status']:<10}"
          f"{timeline['estimated_completion_days']:<15}{risk['risk_level']:<8}")
