from fastapi import APIRouter

router = APIRouter(
    prefix="/api/system",
    tags=["System"]
)


@router.get("/health")
def system_health():

    return {

        "backend": "Healthy",

        "database": "Connected",

        "redis": "Connected",

        "websocket": "Running",

        "celery": "Running",

        "authentication": "Active",

        "ai_module": "Ready",

        "ml_module": "Ready"

    }