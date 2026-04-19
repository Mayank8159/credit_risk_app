import os

os.environ["MODEL_AUTOLOAD"] = "false"

from fastapi.testclient import TestClient

from src.main import app


def test_demo_users_list_contains_three_profiles() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/auth/demo-users")

    assert response.status_code == 200
    users = response.json()["data"]["users"]
    assert len(users) == 3


def test_demo_login_returns_different_outputs_per_user() -> None:
    credentials = [
        {"username": "aarav", "password": "demo123"},
        {"username": "nisha", "password": "demo123"},
        {"username": "rohan", "password": "demo123"},
    ]

    scores: list[int] = []

    with TestClient(app) as client:
        for credential in credentials:
            response = client.post("/api/v1/auth/login", json=credential)
            assert response.status_code == 200
            scores.append(response.json()["data"]["dashboard_preview"]["risk_score"])

    assert scores == [18, 56, 86]


def test_demo_login_invalid_credentials() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "aarav", "password": "wrong"},
        )

    assert response.status_code == 401
