"""
Run this ONCE if you still have Task_Dataset.csv (the file the notebooks
trained on). It reproduces the exact LabelEncoder mappings the models were
trained with and saves them to encoders.pkl, so the API can encode real
database values (e.g. "High") into the exact integers the models expect
(e.g. 2), instead of guessing.

Usage:
    python generate_encoders.py

This assumes the notebooks' default behavior: sklearn's LabelEncoder(),
which assigns integer codes in sorted order of the unique string values it
sees during .fit(). As long as Task_Dataset.csv has the same categorical
values used in training, this reproduces the same mapping exactly.
"""
import pandas as pd
import pickle
from sklearn.preprocessing import LabelEncoder

CATEGORICAL_COLUMNS = ["Assigned_User", "Priority", "Complexity", "Team"]

dt = pd.read_csv("Task_Dataset.csv")

encoders = {}
for col in CATEGORICAL_COLUMNS:
    le = LabelEncoder()
    le.fit(dt[col])
    encoders[col] = le
    print(f"{col}: {dict(zip(le.classes_, le.transform(le.classes_)))}")

with open("encoders.pkl", "wb") as f:
    pickle.dump(encoders, f)

print("\nSaved encoders.pkl — the API will now pick this up automatically.")
