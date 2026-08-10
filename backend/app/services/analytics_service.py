from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User


# =========================================================
# DASHBOARD SUMMARY
# =========================================================

def dashboard_summary(db: Session):

    # -----------------------------------------------------
    # Total active tasks
    # -----------------------------------------------------

    total_tasks = (
        db.query(Task)
        .filter(
            Task.is_deleted == False
        )
        .count()
    )

    # -----------------------------------------------------
    # Completed tasks
    # -----------------------------------------------------

    completed_tasks = (
        db.query(Task)
        .filter(
            Task.status == "Completed",
            Task.is_deleted == False
        )
        .count()
    )

    # -----------------------------------------------------
    # Pending tasks
    # -----------------------------------------------------

    pending_tasks = (
        db.query(Task)
        .filter(
            Task.status == "Pending",
            Task.is_deleted == False
        )
        .count()
    )

    # -----------------------------------------------------
    # In-progress tasks
    # -----------------------------------------------------

    in_progress_tasks = (
        db.query(Task)
        .filter(
            Task.status == "In Progress",
            Task.is_deleted == False
        )
        .count()
    )

    # -----------------------------------------------------
    # Overdue tasks
    #
    # A task is overdue when:
    # 1. Due date is before today
    # 2. Task is not completed
    # 3. Task is not deleted
    # -----------------------------------------------------

    overdue_tasks = (
        db.query(Task)
        .filter(
            Task.due_date < date.today(),
            Task.status != "Completed",
            Task.is_deleted == False
        )
        .count()
    )

    # -----------------------------------------------------
    # Total team members
    # -----------------------------------------------------

    total_users = (
        db.query(User)
        .count()
    )

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "overdue_tasks": overdue_tasks,
        "team_members": total_users,
    }


# =========================================================
# PRODUCTIVITY REPORT
# =========================================================

def productivity_report(db: Session):

    results = (
        db.query(
            User.name,
            func.count(Task.id).label("completed_tasks")
        )
        .join(
            Task,
            Task.assigned_to == User.id
        )
        .filter(
            Task.status == "Completed",
            Task.is_deleted == False
        )
        .group_by(
            User.name
        )
        .all()
    )

    data = []

    for row in results:

        data.append(
            {
                "employee": row.name,
                "completed_tasks": row.completed_tasks,
            }
        )

    return data


# =========================================================
# PERFORMANCE REPORT
# =========================================================

def performance_report(db: Session):

    users = (
        db.query(User)
        .all()
    )

    data = []

    for user in users:

        # -------------------------------------------------
        # Total tasks assigned to employee
        # -------------------------------------------------

        total = (
            db.query(Task)
            .filter(
                Task.assigned_to == user.id,
                Task.is_deleted == False
            )
            .count()
        )

        # -------------------------------------------------
        # Completed tasks
        # -------------------------------------------------

        completed = (
            db.query(Task)
            .filter(
                Task.assigned_to == user.id,
                Task.status == "Completed",
                Task.is_deleted == False
            )
            .count()
        )

        # -------------------------------------------------
        # Pending tasks
        # -------------------------------------------------

        pending = (
            db.query(Task)
            .filter(
                Task.assigned_to == user.id,
                Task.status == "Pending",
                Task.is_deleted == False
            )
            .count()
        )

        # -------------------------------------------------
        # In-progress tasks
        # -------------------------------------------------

        in_progress = (
            db.query(Task)
            .filter(
                Task.assigned_to == user.id,
                Task.status == "In Progress",
                Task.is_deleted == False
            )
            .count()
        )

        # -------------------------------------------------
        # Completion rate
        # -------------------------------------------------

        completion_rate = 0

        if total > 0:
            completion_rate = round(
                (completed / total) * 100,
                2
            )

        # -------------------------------------------------
        # Employee performance response
        # -------------------------------------------------

        data.append(
            {
                "id": str(user.id),
                "user_id": str(user.id),
                "name": user.name,
                "employee": user.name,
                "department": user.department,
                "total_tasks": total,
                "completed": completed,
                "completed_tasks": completed,
                "pending": pending,
                "in_progress": in_progress,
                "completion_rate": completion_rate,
            }
        )

    return data


# =========================================================
# RISK PREDICTIONS
# =========================================================

def risk_predictions(db: Session):

    # -----------------------------------------------------
    # Get active, non-completed tasks
    # -----------------------------------------------------

    tasks = (
        db.query(Task)
        .filter(
            Task.is_deleted == False,
            Task.status != "Completed"
        )
        .all()
    )

    result = []

    today = date.today()

    for task in tasks:

        # -------------------------------------------------
        # Ignore tasks without a due date
        # -------------------------------------------------

        if task.due_date is None:
            continue

        # -------------------------------------------------
        # Calculate remaining days
        # -------------------------------------------------

        days_left = (
            task.due_date - today
        ).days

        # -------------------------------------------------
        # Risk classification
        # -------------------------------------------------

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

        # -------------------------------------------------
        # Add prediction
        # -------------------------------------------------

        result.append(
            {
                "id": str(task.id),
                "task_id": str(task.id),
                "title": task.title,
                "status": task.status,
                "days_remaining": days_left,
                "risk_level": risk,
                "risk_score": score,
                "severity": risk,
            }
        )

    return result