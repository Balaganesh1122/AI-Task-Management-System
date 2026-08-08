def test_register_user(client):
    payload = {
        "name": "Test User 2",
        "email": "testuser_week4_2@example.com",
        "password": "TestPassword123!",
        "role": "Developer",
        "department": "Engineering",
        "skills": "Python, FastAPI"
    }

    response = client.post("/api/auth/register", json=payload)

    print("\nREGISTER RESPONSE:", response.status_code)
    print("REGISTER BODY:", response.json())

    assert response.status_code in [200, 201]


def test_register_duplicate_email(client):
    payload = {
        "name": "Duplicate User",
        "email": "duplicate_week4@example.com",
        "password": "TestPassword123!",
        "role": "Developer",
        "department": "Engineering",
        "skills": "Python"
    }

    first_response = client.post(
        "/api/auth/register",
        json=payload
    )

    assert first_response.status_code in [200, 201]

    second_response = client.post(
        "/api/auth/register",
        json=payload
    )

    assert second_response.status_code == 409


def test_login_valid_credentials(client):
    payload = {
        "name": "Login Test User",
        "email": "login_week4@example.com",
        "password": "TestPassword123!",
        "role": "Developer",
        "department": "Engineering",
        "skills": "Python"
    }

    register_response = client.post(
        "/api/auth/register",
        json=payload
    )

    assert register_response.status_code in [200, 201]

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": payload["email"],
            "password": payload["password"]
        }
    )

    assert login_response.status_code == 200

    data = login_response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client):
    payload = {
        "name": "Invalid Password User",
        "email": "invalid_password_week4@example.com",
        "password": "CorrectPassword123!",
        "role": "Developer",
        "department": "Engineering",
        "skills": "Python"
    }

    register_response = client.post(
        "/api/auth/register",
        json=payload
    )

    assert register_response.status_code in [200, 201]

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": payload["email"],
            "password": "WrongPassword123!"
        }
    )

    assert login_response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "does_not_exist_week4@example.com",
            "password": "SomePassword123!"
        }
    )

    assert response.status_code == 401