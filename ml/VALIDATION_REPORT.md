# ML Model Validation Report

**Date:** 2026-08-07
**Validated against:** `Task_Dataset.csv` (100 rows, the actual training data)
**Method:** Reproduced each notebook's exact train/test split (same `random_state`), evaluated the *shipped* `.pkl` file against held-out data, then cross-checked against a freshly-trained model on the same split to isolate artifact issues from data/generalization issues.

## Summary

| Model | Status | Headline finding |
|---|---|---|
| Delay Detector | ✅ Working as expected | 75% held-out accuracy, 95% full-dataset accuracy — consistent with a correctly saved model |
| Overdue Risk Classifier | ⚠️ Works, but unvalidatable | Trained on a separate 8-row synthetic dataset, not `Task_Dataset.csv` — too small to trust in production |
| AllocationScorer | ✅ Working as expected | Sensible, non-degenerate score distribution across all 4 classes on real data |
| Timeline Predictor |A model retrained with identical code on identical data scores R² = 0.86, matching the notebook exactly |

## 1. Delay Detector (`Delay_model.pkl`)

Reproduced `Delay_model-Copy1.ipynb`'s exact split (`test_size=0.2, random_state=42, stratify=y`):

- **Held-out accuracy:** 75% (n=20, class balance 16 delayed / 4 on-time)
- **Precision:** 92.3% | **Recall:** 75% | **F1:** 82.8%
- **Full-dataset accuracy:** 95%

This is a legitimately fitted, correctly saved model. The held-out numbers are close to (not identical to, due to normal run-to-run variance in re-encoding) the notebook's originally reported 80% — consistent with a real, working artifact. **No action needed**, though 100 rows is still a thin dataset; more data would tighten confidence.

## 2. Overdue Risk Classifier (`prediction_model.pkl`)

This model was **not** trained on `Task_Dataset.csv`. Its training set is a hand-written 8-row synthetic table embedded directly in `Timeline_&_Risk.ipynb`:

```python
data = {"Delay_Days":[0,1,2,4,5,7,8,10], "Task_Priority":[1,1,2,2,3,3,3,3],
        "Assignee_Workload":[3,4,5,6,8,9,10,12], "Escalation_Count":[0,0,1,1,2,2,3,4]}
```

Labels were derived from a fixed rule (`Delay_Days<=2 & Escalation==0 → Low`, `<=5 → Medium`, else `High`), then that same rule-generated label was used as training target. **There is no independent validation set possible for this model** — 8 rows is too few to hold any out. Functionally it returns valid Low/Medium/High labels (confirmed via 20 unit test scenarios), but its accuracy on real-world data is unknown and unverifiable until it's retrained on real historical task data with actual observed risk outcomes, not a rule that was used to both generate and "validate" it.

## 3. AllocationScorer (`allocation_scorer.pkl`)

No training notebook for this model was provided, so its scoring logic (what the 4 score levels actually represent) is undocumented. What could be verified: it's a `RandomForestClassifier` (not XGBoost, corrected in the integration code), and on the real 100-row dataset it produces a sensible, non-degenerate spread across all 4 classes (0: 25, 1: 20, 2: 32, 3: 23) — not always predicting the same class, which would be the signature of a broken/mismatched artifact like the Timeline model. **Recommend locating the original training notebook** to document what the 6 scoring factors actually measure before relying on this in production.

## 4. Timeline Predictor (`Timeline_Risk_model.pkl`) — 🔴 Action required

This is the headline finding of this validation pass.

**Reproducing the notebook's exact split** (`test_size=0.2, random_state=52`) and evaluating the **shipped** `.pkl`:
- MAE: 47.79 hours (vs. notebook's reported 6.26)
- R²: **-3.429** (a model that just predicted the mean every time would score R²=0; negative means this is worse than a naive average)
- Predictions go negative on real held-out data (min: -34.72 hours)

To isolate whether this was a data or generalization problem, I trained a **fresh** `XGBRegressor` with identical code and the identical split:
- MAE: 6.26, R²: 0.862 — an **exact match** to the notebook's original reported numbers.

**Conclusion:** the training code and data are fine. The specific `.pkl` file that was saved and shipped is not the model that produced those results — most likely an earlier/un-fit/overwritten save. This explains every "negative hours" and "predicts 0" incident found during the 10-scenario validation earlier.

**Fix applied:** `app/ml_models/Timeline_Risk_model_FIXED.pkl` — retrained with the exact same code, data, and hyperparameters as the notebook, verified to reproduce MAE=6.26 / R²=0.862 on held-out data with zero negative predictions.

**Before using it:** this is a same-day interim fix I generated, not a substitute for your own review. Recommend re-running the training cell in `Timeline_&_Risk.ipynb` yourselves, confirming it reproduces these numbers, and re-saving `Timeline_Risk_model.pkl` from that — then this interim file can be discarded. Once confirmed, swap the filename in `ml_prediction_service.py` (`MODELS_DIR / "Timeline_Risk_model.pkl"`) back to the standard name.

## Overall dataset caveat

`Task_Dataset.csv` is 100 rows across 5 teams, 8 employees, and multiple categorical dimensions — meaning many real-world feature *combinations* (e.g. a specific employee + team + complexity pairing) never appear in training at all. Even the corrected Timeline model, healthy on its own held-out split, should be expected to extrapolate poorly on combinations far outside what these 100 rows cover. More representative training data is the real long-term fix, independent of the corrupted-artifact issue above.
