from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.auth import router as auth_router

from fastapi import Depends
from app.core.dependencies import get_current_user
from app.api.task import router as task_router
from app.api.websocket import router as websocket_router
from app.api.project import router as project_router
from app.api.user import router as user_router
from app.api.email import router as email_router
from app.api.recommendation import router as recommendation_router
from app.api.update import router as update_router
from app.api.analytics import router as analytics_router
from app.api.report import router as report_router
from app.api.system import router as system_router


app = FastAPI(
    title="AI Task Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

app.include_router(health_router)

app.include_router(task_router)

app.include_router(websocket_router)

app.include_router(project_router)

app.include_router(user_router)

app.include_router(email_router)

app.include_router(recommendation_router)

app.include_router(update_router)

app.include_router(analytics_router)

app.include_router(report_router)

app.include_router(system_router)


@app.get("/")
def root(current_user=Depends(get_current_user)):
    return {
        "message": "Welcome",
        "user": current_user
    }