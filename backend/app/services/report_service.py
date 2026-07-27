from datetime import date
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User


def generate_daily_report(db: Session):

    total_tasks = db.query(Task).filter(
        Task.is_deleted == False
    ).count()

    completed = db.query(Task).filter(
        Task.status == "Done",
        Task.is_deleted == False
    ).count()

    pending = db.query(Task).filter(
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

    return {
        "report_type": "Daily",
        "generated_on": str(date.today()),
        "summary": {
            "total_tasks": total_tasks,
            "completed": completed,
            "pending": pending,
            "in_progress": in_progress,
            "overdue": overdue
        }
    }

def generate_weekly_report(db: Session):

    daily = generate_daily_report(db)

    return {
        "report_type": "Weekly",
        "generated_on": str(date.today()),
        "summary": daily["summary"]
    }

def report_history():

    return [

        {
            "report_id":1,
            "type":"Daily",
            "generated_on":"2026-07-26"
        },

        {
            "report_id":2,
            "type":"Weekly",
            "generated_on":"2026-07-21"
        }

    ]

def download_report(report_type: str):

    return {

        "message":"Report generated successfully",

        "type":report_type,

        "filename":f"{report_type}_report.xlsx"

    }