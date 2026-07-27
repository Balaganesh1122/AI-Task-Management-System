from datetime import date
from sqlalchemy.orm import Session
from app.models.task import Task
from app.models.user import User
from sqlalchemy import func
from datetime import date


def dashboard_summary(db: Session):

    total_tasks = db.query(Task).filter(
        Task.is_deleted == False
    ).count()

    completed_tasks = db.query(Task).filter(
        Task.status == "Done",
        Task.is_deleted == False
    ).count()

    pending_tasks = db.query(Task).filter(
        Task.status == "To Do",
        Task.is_deleted == False
    ).count()

    in_progress = db.query(Task).filter(
        Task.status == "In Progress",
        Task.is_deleted == False
    ).count()

    overdue = db.query(Task).filter(
        Task.due_date < date.today(),
        Task.status != "Done",
        Task.is_deleted == False
    ).count()

    total_users = db.query(User).count()

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress,
        "overdue_tasks": overdue,
        "team_members": total_users
    }

def productivity_report(db: Session):

    results = (
        db.query(
            User.name,
            func.count(Task.id).label("completed_tasks")
        )
        .join(Task, Task.assigned_to == User.id)
        .filter(
            Task.status == "Done",
            Task.is_deleted == False
        )
        .group_by(User.name)
        .all()
    )

    data = []

    for row in results:

        data.append(
            {
                "employee": row.name,
                "completed_tasks": row.completed_tasks
            }
        )

    return data

def performance_report(db: Session):

    users = db.query(User).all()

    data = []

    for user in users:

        total = db.query(Task).filter(
            Task.assigned_to == user.id,
            Task.is_deleted == False
        ).count()

        completed = db.query(Task).filter(
            Task.assigned_to == user.id,
            Task.status == "Done",
            Task.is_deleted == False
        ).count()

        pending = db.query(Task).filter(
            Task.assigned_to == user.id,
            Task.status == "To Do",
            Task.is_deleted == False
        ).count()

        in_progress = db.query(Task).filter(
            Task.assigned_to == user.id,
            Task.status == "In Progress",
            Task.is_deleted == False
        ).count()

        completion_rate = 0

        if total > 0:
            completion_rate = round((completed / total) * 100, 2)

        data.append(
            {
                "employee": user.name,
                "department": user.department,
                "total_tasks": total,
                "completed": completed,
                "pending": pending,
                "in_progress": in_progress,
                "completion_rate": completion_rate
            }
        )

    return data

def risk_predictions(db: Session):

    tasks = db.query(Task).filter(
        Task.is_deleted == False,
        Task.status != "Done"
    ).all()

    result = []

    today = date.today()

    for task in tasks:

        days_left = (task.due_date - today).days

        if days_left <= 1:
            risk = "High"
            score = 95

        elif days_left <= 3:
            risk = "Medium"
            score = 75

        elif days_left <= 7:
            risk = "Low"
            score = 45

        else:
            risk = "Minimal"
            score = 15

        result.append({

            "task_id": str(task.id),

            "title": task.title,

            "status": task.status,

            "days_remaining": days_left,

            "risk_level": risk,

            "risk_score": score
        })

    return result