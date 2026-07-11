from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.auth import router as auth_router


app = FastAPI(
    title="AI Task Management System",
    version="1.0.0"
)

app.include_router(auth_router)

app.include_router(health_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to AI Task Management System"
    }