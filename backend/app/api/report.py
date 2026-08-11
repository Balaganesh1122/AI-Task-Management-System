from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.services.report_service import (
    generate_daily_report,
    generate_weekly_report,
    report_history,
    download_report,
)


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


# =========================================================
# DAILY REPORT
# =========================================================

@router.get("/daily")
def daily_report(
    db: Session = Depends(get_db),
):
    return generate_daily_report(db)


# =========================================================
# WEEKLY REPORT
# =========================================================

@router.get("/weekly")
def weekly_report(
    db: Session = Depends(get_db),
):
    return generate_weekly_report(db)


# =========================================================
# REPORT HISTORY
# =========================================================

@router.get("/history")
def history():
    return report_history()


# =========================================================
# DOWNLOAD REPORT
# =========================================================

@router.get("/download")
def download(
    type: str,
    db: Session = Depends(get_db),
):

    file_path = download_report(
        db,
        type,
    )

    # -----------------------------------------------------
    # Invalid report type
    # -----------------------------------------------------

    if isinstance(file_path, dict):
        return file_path

    # -----------------------------------------------------
    # Determine media type
    # -----------------------------------------------------

    if type.strip().lower() == "excel":

        media_type = (
            "application/"
            "vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        )

    else:

        media_type = "application/pdf"

    # -----------------------------------------------------
    # Return generated file
    # -----------------------------------------------------

    return FileResponse(
        path=str(file_path),
        filename=file_path.name,
        media_type=media_type,
    )