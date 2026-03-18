import os

# Prevent startup from requiring a local model artifact during tests.
os.environ["MODEL_AUTOLOAD"] = "false"

from fastapi.testclient import TestClient

from src.api.v1.risk import get_inference_service, get_portfolio_repository
from src.main import app
from src.schemas.risk import PortfolioRiskSnapshot


class StubInferenceService:
    def predict_default_probability(self, feature_payload: dict) -> float:
        return 0.82


class StubPortfolioRepository:
    def get_portfolio_risk_snapshot(self) -> PortfolioRiskSnapshot:
        return PortfolioRiskSnapshot(
            total_assets_inr=890000,
            npc_rate_percent=4.2,
            label="Portfolio Risk",
        )


def test_analyze_endpoint_returns_dashboard_compatible_response() -> None:
    app.dependency_overrides[get_inference_service] = lambda: StubInferenceService()
    app.dependency_overrides[get_portfolio_repository] = lambda: StubPortfolioRepository()

    payload = {
        "person_age": 42,
        "person_income": 90000,
        "person_home_ownership": "MORTGAGE",
        "person_emp_length": 10,
        "loan_intent": "DEBTCONSOLIDATION",
        "loan_grade": "C",
        "loan_amnt": 35000,
        "loan_int_rate": 14.6,
        "loan_percent_income": 0.39,
        "cb_person_default_on_file": "Y",
        "cb_person_cred_hist_length": 14,
    }

    with TestClient(app) as client:
        response = client.post("/api/v1/risk/analyze", json=payload)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()

    assert body["risk_score"] == 82
    assert body["risk_grade"] == "High"
    assert isinstance(body["utilization_rate"], float)
    assert isinstance(body["risk_factors"], list)
    assert body["portfolio_risk"]["total_assets_inr"] == 890000
    assert body["portfolio_risk"]["npc_rate_percent"] == 4.2
