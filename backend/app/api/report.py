from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.services.report_service import generate_daily_report
from app.services.report_service import generate_weekly_report
from app.services.report_service import report_history
from app.services.report_service import download_report


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)


@router.get("/daily")
def daily_report(
    db: Session = Depends(get_db)
):
    return generate_daily_report(db)


@router.get("/weekly")
def weekly_report(
    db: Session = Depends(get_db)
):
    return generate_weekly_report(db)


@router.get("/history")
def history():
    return report_history()


@router.get("/download")
def download(
    type: str,
    db: Session = Depends(get_db)
):

    file_path = download_report(
        db,
        type
    )

    if isinstance(file_path, dict):
        return file_path

    media_type = (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        if type.lower() == "excel"
        else "application/pdf"
    )

    return FileResponse(
        path=str(file_path),
        filename=file_path.name,
        media_type=media_type
    )