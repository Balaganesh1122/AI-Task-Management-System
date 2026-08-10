from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.task import Task


def get_user_workload(db: Session):

    users = db.query(User).all()

    response = []

    for user in users:

        active_tasks = db.query(Task).filter(
            Task.assigned_to == user.id,
            Task.status != "Completed",
            Task.is_deleted == False
        ).count()

        response.append(
            {
                "user_id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "department": user.department,
                "skills": user.skills,
                "active_tasks": active_tasks,
                "workload_score": user.workload_score,
                "available_hours": max(0, 40 - (active_tasks * 8))
            }
        )

    return response

def get_users_by_skill(db: Session, task_category: str):

    users = db.query(User).filter(
        User.skills.ilike(f"%{task_category}%")
    ).all()

    result = []

    for user in users:

        result.append(
            {
                "user_id": str(user.id),
                "name": user.name,
                "email": user.email,
                "department": user.department,
                "skills": user.skills,
                "workload_score": user.workload_score
            }
        )

    return result