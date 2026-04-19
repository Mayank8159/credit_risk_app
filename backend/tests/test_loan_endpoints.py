import os

os.environ["MODEL_AUTOLOAD"] = "false"

from fastapi.testclient import TestClient

from src.main import app


def test_loan_categories_endpoint() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/loan/categories")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]["categories"]) == 5


def test_apply_loan_and_list_applications() -> None:
    payload = {
        "user_id": "aarav",
        "loan_amount": 750000,
        "loan_category": "HOME",
        "selected_bank": "SBI",
        "salary": 90000,
        "cibil_score": 780,
        "tenure": 120,
    }

    with TestClient(app) as client:
        apply_response = client.post("/api/v1/loan/apply", json=payload)
        list_response = client.get("/api/v1/loan/applications")

    assert apply_response.status_code == 200
    apply_body = apply_response.json()
    assert apply_body["success"] is True
    assert "application" in apply_body["data"]
    assert apply_body["data"]["application"]["emi"] > 0

    assert list_response.status_code == 200
    list_body = list_response.json()
    assert list_body["success"] is True
    assert isinstance(list_body["data"]["applications"], list)


def test_apply_loan_validation_error_shape() -> None:
    invalid_payload = {
        "user_id": "aarav",
        "loan_amount": 750000,
        "loan_category": "HOME",
        "selected_bank": "SBI",
        "salary": 90000,
        "cibil_score": 780,
        "tenure": 9999,
    }

    with TestClient(app) as client:
        response = client.post("/api/v1/loan/apply", json=invalid_payload)

    assert response.status_code == 400
    body = response.json()
    assert body["success"] is False
    assert isinstance(body["error"], str)
