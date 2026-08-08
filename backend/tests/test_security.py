from datetime import datetime, timedelta

from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.utils.jwt_handler import (
    create_access_token,
    verify_access_token,
)

from app.core.dependencies import get_current_user


def test_create_access_token():
    payload = {
        "user_id": "test-user-123",
        "role": "Developer",
    }

    token = create_access_token(payload)

    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 0


def test_verify_valid_access_token():
    payload = {
        "user_id": "test-user-456",
        "role": "Developer",
    }

    token = create_access_token(payload)

    decoded_payload = verify_access_token(token)

    assert decoded_payload is not None
    assert decoded_payload["user_id"] == "test-user-456"
    assert decoded_payload["role"] == "Developer"


def test_verify_invalid_access_token():
    invalid_token = "this.is.not.a.valid.jwt"

    decoded_payload = verify_access_token(
        invalid_token
    )

    assert decoded_payload is None


def test_verify_expired_access_token():
    from app.utils import jwt_handler
    from jose import jwt

    expired_payload = {
        "user_id": "expired-user",
        "exp": datetime.utcnow() - timedelta(minutes=5),
    }

    expired_token = jwt.encode(
        expired_payload,
        jwt_handler.SECRET_KEY,
        algorithm=jwt_handler.ALGORITHM,
    )

    decoded_payload = verify_access_token(
        expired_token
    )

    assert decoded_payload is None


def test_get_current_user_valid_token():
    payload = {
        "user_id": "test-user-789",
        "role": "Manager",
    }

    token = create_access_token(payload)

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token,
    )

    result = get_current_user(credentials)

    assert result is not None
    assert result["user_id"] == "test-user-789"
    assert result["role"] == "Manager"


def test_get_current_user_invalid_token():
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials="invalid.token.value",
    )

    try:
        get_current_user(credentials)

        # The function should never reach here.
        assert False, "Expected HTTPException"

    except HTTPException as exc:
        assert exc.status_code == 401
        assert exc.detail == "Invalid or expired token"