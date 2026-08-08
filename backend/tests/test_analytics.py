from datetime import date, timedelta


def create_task(client, title, status, due_date):
    payload = {
        "title": title,
        "description": f"Analytics test task - {title}",
        "priority": "Medium",
        "status": status,
        "due_date": str(due_date),
        "assigned_to": None,
        "project_id": None,
    }

    response = client.post(
        "/api/tasks/",
        json=payload
    )

    assert response.status_code in [200, 201]

    return response.json()["task_id"]


def test_dashboard_analytics(client):
    response = client.get(
        "/api/analytics/dashboard"
    )

    assert response.status_code == 200

    data = response.json()

    # Dashboard must return all required KPIs.
    assert "total_tasks" in data
    assert "completed_tasks" in data
    assert "pending_tasks" in data
    assert "in_progress_tasks" in data
    assert "overdue_tasks" in data
    assert "team_members" in data

    # KPI values should be integers.
    assert isinstance(data["total_tasks"], int)
    assert isinstance(data["completed_tasks"], int)
    assert isinstance(data["pending_tasks"], int)
    assert isinstance(data["in_progress_tasks"], int)
    assert isinstance(data["overdue_tasks"], int)
    assert isinstance(data["team_members"], int)

    # Counts should never be negative.
    assert data["total_tasks"] >= 0
    assert data["completed_tasks"] >= 0
    assert data["pending_tasks"] >= 0
    assert data["in_progress_tasks"] >= 0
    assert data["overdue_tasks"] >= 0
    assert data["team_members"] >= 0


def test_productivity_analytics(client):
    response = client.get(
        "/api/analytics/productivity"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)

    # Every productivity record must contain
    # employee name and completed task count.
    for record in data:
        assert "employee" in record
        assert "completed_tasks" in record

        assert isinstance(record["employee"], str)
        assert isinstance(record["completed_tasks"], int)

        assert record["completed_tasks"] >= 0


def test_performance_analytics(client):
    response = client.get(
        "/api/analytics/performance"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)

    # Validate each employee performance record.
    for record in data:
        assert "employee" in record
        assert "department" in record
        assert "total_tasks" in record
        assert "completed" in record
        assert "pending" in record
        assert "in_progress" in record
        assert "completion_rate" in record

        assert isinstance(record["employee"], str)

        assert isinstance(
            record["total_tasks"],
            int
        )

        assert isinstance(
            record["completed"],
            int
        )

        assert isinstance(
            record["pending"],
            int
        )

        assert isinstance(
            record["in_progress"],
            int
        )

        assert isinstance(
            record["completion_rate"],
            (int, float)
        )

        assert record["total_tasks"] >= 0
        assert record["completed"] >= 0
        assert record["pending"] >= 0
        assert record["in_progress"] >= 0

        # Completion rate should be between 0 and 100.
        assert 0 <= record["completion_rate"] <= 100


def test_risk_predictions(client):
    response = client.get(
        "/api/analytics/risk-predictions"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)

    for record in data:
        assert "task_id" in record
        assert "title" in record
        assert "status" in record
        assert "days_remaining" in record
        assert "risk_level" in record
        assert "risk_score" in record

        assert isinstance(record["task_id"], str)
        assert isinstance(record["title"], str)
        assert isinstance(record["status"], str)
        assert isinstance(record["days_remaining"], int)

        assert record["risk_level"] in [
            "High",
            "Medium",
            "Low",
            "Minimal"
        ]

        assert record["risk_score"] in [
            95,
            75,
            45,
            15
        ]

        assert 0 <= record["risk_score"] <= 100


def test_risk_prediction_excludes_completed_tasks(client):
    # Create a completed task.
    create_task(
        client,
        "Completed Analytics Task",
        "Done",
        date.today() + timedelta(days=2)
    )

    response = client.get(
        "/api/analytics/risk-predictions"
    )

    assert response.status_code == 200

    data = response.json()

    task_titles = [
        record["title"]
        for record in data
    ]

    # Completed tasks should not appear in risk predictions.
    assert "Completed Analytics Task" not in task_titles


def test_risk_prediction_high_risk_task(client):
    task_id = create_task(
        client,
        "High Risk Analytics Task",
        "To Do",
        date.today()
    )

    response = client.get(
        "/api/analytics/risk-predictions"
    )

    assert response.status_code == 200

    data = response.json()

    matching_tasks = [
        record
        for record in data
        if record["task_id"] == str(task_id)
    ]

    assert len(matching_tasks) == 1

    task = matching_tasks[0]

    assert task["risk_level"] == "High"
    assert task["risk_score"] == 95