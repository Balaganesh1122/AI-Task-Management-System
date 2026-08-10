FROM python:3.12-slim

WORKDIR /app

# System deps needed by psycopg2 (Postgres driver) build
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-ml.txt .
RUN pip install --no-cache-dir -r requirements-ml.txt

COPY app ./app
COPY migrations ./migrations
COPY alembic.ini .

# Fail the build early if any model can't load, rather than at first request.
# Checks Timeline_Risk_model_FIXED.pkl (the corrected artifact ml_prediction_service.py
# actually loads) alongside the original -- see VALIDATION_REPORT.md for why.
RUN python -c "\
import joblib; \
[joblib.load(f'app/ml_models/{f}') for f in [ \
    'allocation_scorer.pkl', 'Delay_model.pkl', \
    'Timeline_Risk_model_FIXED.pkl', 'prediction_model.pkl', 'encoders.pkl']]; \
print('All ML models load OK')"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
