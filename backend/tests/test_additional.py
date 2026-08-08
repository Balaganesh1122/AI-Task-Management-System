# ============================================================
# TEST ADDITIONAL BACKEND APIs
# ============================================================

# ============================================================
# USER HELPER
# ============================================================

def create_user(
    client,
    email="week4_extra@example.com"
):
    payload = {
        "name": "Week 4 Extra User",
        "email": email,
        "password": "TestPassword123!",
        "role": "Developer",
        "department": "Engineering",
        "skills": "Python, FastAPI, Machine Learning"
    }

    response = client.post(
        "/api/auth/register",
        json=payload
    )

    assert response.status_code in [200, 201]

    return response


# ============================================================
# USER APIs
# ============================================================

def test_user_workload(client):
    create_user(
        client,
        "workload_week4@example.com"
    )

    response = client.get(
        "/api/users/workload"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)

    for user in data:
        assert "user_id" in user
        assert "name" in user
        assert "email" in user
        assert "role" in user
        assert "department" in user
        assert "skills" in user
        assert "active_tasks" in user
        assert "workload_score" in user
        assert "available_hours" in user

        assert isinstance(user["active_tasks"], int)
        assert isinstance(user["available_hours"], (int, float))

        assert user["active_tasks"] >= 0
        assert user["available_hours"] >= 0


def test_user_skills_match(client):
    create_user(
        client,
        "skills_week4@example.com"
    )

    response = client.get(
        "/api/users/skills-match",
        params={
            "task_category": "Python"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)

    for user in data:
        assert "user_id" in user
        assert "name" in user
        assert "email" in user
        assert "department" in user
        assert "skills" in user
        assert "workload_score" in user


def test_user_skills_match_no_results(client):
    response = client.get(
        "/api/users/skills-match",
        params={
            "task_category": "NonExistingSkillXYZ"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 0


# ============================================================
# REPORT APIs
# ============================================================

def test_daily_report(client):
    response = client.get(
        "/api/reports/daily"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["report_type"] == "Daily"
    assert "generated_on" in data
    assert "summary" in data

    summary = data["summary"]

    assert "total_tasks" in summary
    assert "completed" in summary
    assert "pending" in summary
    assert "in_progress" in summary
    assert "overdue" in summary

    assert isinstance(summary["total_tasks"], int)
    assert isinstance(summary["completed"], int)
    assert isinstance(summary["pending"], int)
    assert isinstance(summary["in_progress"], int)
    assert isinstance(summary["overdue"], int)


def test_weekly_report(client):
    response = client.get(
        "/api/reports/weekly"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["report_type"] == "Weekly"
    assert "generated_on" in data
    assert "summary" in data

    summary = data["summary"]

    assert "total_tasks" in summary
    assert "completed" in summary
    assert "pending" in summary
    assert "in_progress" in summary
    assert "overdue" in summary


def test_report_history(client):
    response = client.get(
        "/api/reports/history"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)

    for report in data:
        assert "report_id" in report
        assert "type" in report
        assert "generated_on" in report

        assert report["type"] in [
            "Daily",
            "Weekly"
        ]


def test_download_excel_report(client):
    response = client.get(
        "/api/reports/download",
        params={
            "type": "excel"
        }
    )

    assert response.status_code == 200

    # XLSX files are ZIP-based and start with PK
    assert response.content[:2] == b"PK"

    # Verify Excel content type
    assert (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        in response.headers["content-type"]
    )

    # The backend generates daily_report.xlsx
    assert (
        "daily_report.xlsx"
        in response.headers["content-disposition"]
    )


def test_download_pdf_report(client):
    response = client.get(
        "/api/reports/download",
        params={
            "type": "pdf"
        }
    )

    assert response.status_code == 200

    # PDF files start with %PDF
    assert response.content[:4] == b"%PDF"

    # Verify PDF content type
    assert "application/pdf" in response.headers["content-type"]

    # The backend generates daily_report.pdf
    assert (
        "daily_report.pdf"
        in response.headers["content-disposition"]
    )


# ============================================================
# CELERY TASKS
# ============================================================

def test_celery_test_task():
    from app.tasks import test_task

    result = test_task.run()

    assert result == "Celery Working"


def test_celery_daily_report():
    from app.tasks import daily_report

    result = daily_report.run()

    assert result is None


def test_celery_weekly_report():
    from app.tasks import weekly_report

    result = weekly_report.run()

    assert result is None


def test_celery_monthly_report():
    from app.tasks import monthly_report

    result = monthly_report.run()

    assert result is None