from sqlalchemy.orm import Session

from app.models.project import Project


def get_all_projects(db: Session):

    projects = db.query(Project).all()

    return projects