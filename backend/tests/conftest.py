import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use the dedicated test database.
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg2://postgres:Gani%40123@localhost:5432/ai_task_management_test",
)

from app.main import app
from app.database.base import Base
from app.database.connection import get_db

# Import every model so SQLAlchemy registers all tables.
from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.models.task_assignment import TaskAssignment
from app.models.assignment import Assignment
from app.models.email_log import EmailLog
from app.models.audit_trail import AuditTrail


engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def test_engine():
    return engine


@pytest.fixture(scope="session", autouse=True)
def create_test_tables(test_engine):
    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()

    session = TestingSessionLocal(bind=connection)

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client():
    return TestClient(app)