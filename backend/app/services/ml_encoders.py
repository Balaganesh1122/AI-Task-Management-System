"""
Encodes real DB categorical values (e.g. Task.priority = "High") into the
integers the models were trained on.

IMPORTANT CAVEAT: the original training notebooks called sklearn's
LabelEncoder() on Priority/Complexity/Team/Assigned_User but never saved the
fitted encoders. Nobody can be 100% certain what integer the trained models
actually associate with e.g. "High" priority vs "Low" priority.

Fix path (recommended): if you still have the original Task_Dataset.csv,
run scripts/generate_encoders.py against it to reproduce the exact
training-time encoders and save app/ml_models/encoders.pkl. This module
picks that up automatically the moment it exists.

Fallback (used only if encoders.pkl is missing): alphabetical-order
encoding, which is what sklearn's LabelEncoder does by default. This is a
best-effort guess, not a guarantee. Every prediction response includes an
`encoding_verified` flag reflecting which mode is active.
"""
import hashlib
import pickle
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent / "ml_models"
ENCODERS_PATH = BASE_DIR / "encoders.pkl"

_real_encoders = None
if ENCODERS_PATH.exists():
    with open(ENCODERS_PATH, "rb") as f:
        _real_encoders = pickle.load(f)

# Edit these to match your real DB category values if you don't have
# Task_Dataset.csv to regenerate real encoders.
# These now mirror the actual categories found in Task_Dataset.csv.
FALLBACK_CATEGORIES = {
    "Priority": ["Critical", "High", "Low", "Medium"],
    "Complexity": ["High", "Low", "Medium"],
    "Team": ["Backend", "Data", "DevOps", "Frontend", "QA"],
}


def using_real_encoders() -> bool:
    return _real_encoders is not None


def encode(column: str, value):
    if value is None:
        raise ValueError(f"Task.{column.lower()} is not set — cannot run this prediction yet.")

    if _real_encoders is not None:
        le = _real_encoders[column]
        return int(le.transform([value])[0])

    categories = sorted(FALLBACK_CATEGORIES[column])
    if value not in categories:
        raise ValueError(
            f"'{value}' not in known {column} categories {categories}. "
            f"Update FALLBACK_CATEGORIES in ml_encoders.py, or better, run generate_encoders.py."
        )
    return categories.index(value)


def encode_user(user_id) -> int:
    """
    Assigned_User was LabelEncoded at training time from whatever identifier
    was in Task_Dataset.csv — not a UUID. Without the real encoder, mapping a
    UUID to a small int is a placeholder, not a verified match — run
    generate_encoders.py for a real mapping.

    Uses a stable hash (not Python's built-in hash(), which is randomized per
    process via PYTHONHASHSEED and would silently change every restart,
    making predictions for the same task non-reproducible across deploys).
    """
    if _real_encoders is not None and "Assigned_User" in _real_encoders:
        le = _real_encoders["Assigned_User"]
        try:
            return int(le.transform([str(user_id)])[0])
        except ValueError:
            pass
    # UUID.int is stable and deterministic regardless of process/session.
    if hasattr(user_id, "int"):
        return user_id.int % 1000
    digest = hashlib.md5(str(user_id).encode()).hexdigest()
    return int(digest, 16) % 1000
