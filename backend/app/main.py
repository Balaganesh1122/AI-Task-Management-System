from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.auth import router as auth_router

from fastapi import Depends
from app.core.dependencies import get_current_user


app = FastAPI(
    title="AI Task Management System",
    version="1.0.0"
)

app.include_router(auth_router)

app.include_router(health_router)

@app.get("/")
def root(current_user=Depends(get_current_user)):
    return {
        "message": "Welcome",
        "user": current_user
    }