from datetime import date
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.task import Task

from openpyxl import Workbook

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors


# Directory where generated reports will be stored
REPORT_DIR = Path("generated_reports")
REPORT_DIR.mkdir(exist_ok=True)


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
            "report_id": 1,
            "type": "Daily",
            "generated_on": "2026-07-26"
        },
        {
            "report_id": 2,
            "type": "Weekly",
            "generated_on": "2026-07-21"
        }
    ]


def create_excel_report(report_data, filename):

    file_path = REPORT_DIR / filename

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Task Report"

    sheet["A1"] = "AI Task Management System"
    sheet["A2"] = report_data["report_type"] + " Report"
    sheet["A3"] = "Generated On"
    sheet["B3"] = report_data["generated_on"]

    sheet["A5"] = "Metric"
    sheet["B5"] = "Count"

    summary = report_data["summary"]

    rows = [
        ("Total Tasks", summary["total_tasks"]),
        ("Completed", summary["completed"]),
        ("Pending", summary["pending"]),
        ("In Progress", summary["in_progress"]),
        ("Overdue", summary["overdue"]),
    ]

    row_number = 6

    for metric, count in rows:
        sheet.cell(row=row_number, column=1, value=metric)
        sheet.cell(row=row_number, column=2, value=count)
        row_number += 1

    workbook.save(file_path)

    return file_path


def create_pdf_report(report_data, filename):

    file_path = REPORT_DIR / filename

    document = SimpleDocTemplate(
        str(file_path),
        pagesize=A4
    )

    summary = report_data["summary"]

    data = [
        ["Metric", "Count"],
        ["Total Tasks", summary["total_tasks"]],
        ["Completed", summary["completed"]],
        ["Pending", summary["pending"]],
        ["In Progress", summary["in_progress"]],
        ["Overdue", summary["overdue"]],
    ]

    table = Table(data)

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("ALIGN", (1, 1), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ])
    )

    document.build([table])

    return file_path


def download_report(db: Session, report_type: str):

    report_type = report_type.lower()

    if report_type not in ["excel", "pdf"]:
        return {
            "message": "Invalid report type",
            "supported_types": ["excel", "pdf"]
        }

    report_data = generate_daily_report(db)

    if report_type == "excel":

        filename = "daily_report.xlsx"

        file_path = create_excel_report(
            report_data,
            filename
        )

        return file_path

    filename = "daily_report.pdf"

    file_path = create_pdf_report(
        report_data,
        filename
    )

    return file_path