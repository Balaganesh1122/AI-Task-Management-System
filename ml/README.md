# ML Module — AI Task Management

Complete, validated ML integration module. Status: **all 48 tests passing**, models verified against real training data (see `VALIDATION_REPORT.md`).

## What's in here

```
app/
├── ml_models/
│   ├── allocation_scorer.pkl          ✅ verified healthy (RandomForestClassifier)
│   ├── Delay_model.pkl                 ✅ verified healthy (95% full-data accuracy)
│   ├── Timeline_Risk_model_FIXED.pkl   ✅ interim corrected version — ml_prediction_service.py loads THIS one
│   ├── prediction_model.pkl                works, but trained on 8 synthetic rows — accuracy unverifiable
│   └── encoders.pkl                    ✅ real LabelEncoders regenerated from Task_Dataset.csv
├── services/
│   ├── ml_prediction_service.py        Core inference logic — pulls Task/User rows, encodes, predicts, saves back
│   └── ml_encoders.py                  Categorical encoding (real encoders.pkl, with documented fallback)
└── api/
    └── ml_predictions.py               4 FastAPI endpoints (allocation, delay, timeline, risk)

tests/
└── test_ml_models.py                   48 unit tests, including 2 regression tests locking in real bugs found

VALIDATION_REPORT.md                    Full findings: accuracy/R² numbers, the Timeline model corruption, dataset caveats
generate_encoders.py                    Re-run against Task_Dataset.csv if you retrain and need fresh encoders
run_scenarios.py                        Manual smoke-test script — runs 10 realistic scenarios, prints a results table
Dockerfile                              Builds the module, self-checks all models load before declaring success
requirements-ml.txt                     Pinned dependencies verified against these exact .pkl files
```

## Before you deploy this

1. **`Timeline_Risk_model.pkl` (the original) is corrupted.** `ml_prediction_service.py` already points at `Timeline_Risk_model_FIXED.pkl` instead. This is a same-day interim retrain, not a substitute for your own review — re-run `Timeline_&_Risk.ipynb` yourselves, confirm it reproduces MAE≈6.26/R²≈0.86, and replace `Timeline_Risk_model_FIXED.pkl` with your own verified retrain before this goes to production.
2. **`prediction_model.pkl`** (Overdue Risk Classifier) was trained on an 8-row synthetic table with rule-generated labels, not real historical outcomes. It works functionally but its real-world accuracy is unknown. Retrain on real data before trusting it for anything user-facing.
3. **`allocation_scorer.pkl`** has no known training notebook — what its 4 score levels actually represent is undocumented. Functions correctly (sensible non-degenerate output on real data) but locate or reconstruct its training logic before relying on it for consequential decisions.

## Drop-in instructions

Copy `app/services/*`, `app/api/ml_predictions.py`, and `app/ml_models/*` into your existing FastAPI project at matching paths. Add the router in your `main.py`:
```python
from app.api.ml_predictions import router as ml_predictions_router
app.include_router(ml_predictions_router)
```
Requires `Task`/`User` DB columns for: `priority`, `complexity`, `team`, `estimated_hours`, `actual_hours`, `bugs_reported`, `rework_hours`, `sprint`, `escalation_count` (Task) and `experience_years`, `workload_score` (User). Category values must match exactly: `Priority` ∈ {Critical, High, Medium, Low}, `Complexity` ∈ {High, Medium, Low}, `Team` ∈ {Backend, Data, DevOps, Frontend, QA} — case-sensitive.

## Running the tests

```bash
pip install -r requirements-ml.txt
pytest tests/test_ml_models.py -v
```
Expect `48 passed`.
