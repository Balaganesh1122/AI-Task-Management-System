from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import hash_password


def create_user(db: Session, user):
    hashed_password = hash_password(user.password)

    db_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role,
        department=user.department,
        skills=user.skills,
        workload_score=0.0
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user