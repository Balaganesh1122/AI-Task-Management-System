from datetime import date, timedelta
from uuid import uuid4


def create_task_payload():
    return {
        "title": "Week 4 Test Task",
        "description": "Task created during pytest testing",
        "priority": "High",
        "status": "To Do",
        "due_date": str(date.today() + timedelta(days=7)),
        "assigned_to": None,
        "project_id": None,
    }


def create_task(client):
    """Helper function to create a task and return its task_id."""
    response = client.post(
        "/api/tasks/",
        json=create_task_payload()
    )

    assert response.status_code in [200, 201]

    data = response.json()

    assert "task_id" in data

    return data["task_id"]


def test_create_task(client):
    response = client.post(
        "/api/tasks/",
        json=create_task_payload()
    )

    assert response.status_code in [200, 201]

    data = response.json()

    # Actual API response:
    # {
    #     "message": "Task created successfully",
    #     "task_id": "..."
    # }

    assert "task_id" in data
    assert data["message"] == "Task created successfully"


def test_get_tasks(client):
    create_task(client)

    response = client.get("/api/tasks/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_task_by_id(client):
    task_id = create_task(client)

    response = client.get(
        f"/api/tasks/{task_id}"
    )

    assert response.status_code == 200

    data = response.json()

    print("\nGET TASK RESPONSE:", data)

    assert data is not None


def test_update_task(client):
    task_id = create_task(client)

    update_payload = {
        "title": "Updated Week 4 Task",
        "description": "Updated description",
        "priority": "Medium",
        "status": "To Do",
        "due_date": str(date.today() + timedelta(days=10)),
        "assigned_to": None,
        "project_id": None,
    }

    response = client.put(
        f"/api/tasks/{task_id}",
        json=update_payload
    )

    assert response.status_code == 200

    data = response.json()

    print("\nUPDATE TASK RESPONSE:", data)

    assert data is not None


def test_soft_delete_task(client):
    task_id = create_task(client)

    delete_response = client.delete(
        f"/api/tasks/{task_id}"
    )

    assert delete_response.status_code == 200

    delete_data = delete_response.json()

    print("\nDELETE TASK RESPONSE:", delete_data)

    # Verify task is no longer accessible
    get_response = client.get(
        f"/api/tasks/{task_id}"
    )

    assert get_response.status_code == 404


def test_status_change_to_in_progress(client):
    task_id = create_task(client)

    response = client.put(
        f"/api/tasks/{task_id}/status",
        json={
            "status": "In Progress"
        }
    )

    assert response.status_code == 200

    data = response.json()

    print("\nSTATUS UPDATE RESPONSE:", data)

    assert data["message"] == "Task status updated successfully"


def test_status_change_to_done(client):
    task_id = create_task(client)

    # First transition:
    # To Do -> In Progress
    first_response = client.put(
        f"/api/tasks/{task_id}/status",
        json={
            "status": "In Progress"
        }
    )

    assert first_response.status_code == 200

    # Second transition:
    # In Progress -> Done
    second_response = client.put(
        f"/api/tasks/{task_id}/status",
        json={
            "status": "Done"
        }
    )

    assert second_response.status_code == 200

    data = second_response.json()

    assert data["message"] == "Task status updated successfully"


def test_invalid_status_transition(client):
    task_id = create_task(client)

    # Invalid transition:
    # To Do -> Done
    response = client.put(
        f"/api/tasks/{task_id}/status",
        json={
            "status": "Done"
        }
    )

    assert response.status_code == 400


def test_get_nonexistent_task(client):
    fake_task_id = str(uuid4())

    response = client.get(
        f"/api/tasks/{fake_task_id}"
    )

    assert response.status_code == 404