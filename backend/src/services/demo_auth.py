from fastapi import HTTPException

from ..schemas.auth import DemoLoginRequest, DemoLoginResponse, DemoUserProfile
from ..schemas.risk import PortfolioRiskSnapshot, RiskAnalyzeResponse, RiskFactor


class DemoAuthService:
    """Simple in-memory demo user auth service for college project testing."""

    _demo_users: dict[str, dict] = {
        "aarav": {
            "password": "demo123",
            "full_name": "Aarav Sharma",
            "role": "Low Risk Applicant",
            "output": RiskAnalyzeResponse(
                risk_score=18,
                risk_grade="Low",
                utilization_rate=12.8,
                risk_factors=[
                    RiskFactor(
                        factor="Stable baseline profile",
                        impact="Low",
                        value="No critical indicators detected",
                    )
                ],
                portfolio_risk=PortfolioRiskSnapshot(
                    total_assets_inr=890000,
                    npc_rate_percent=4.2,
                    label="Portfolio Risk",
                ),
            ),
        },
        "nisha": {
            "password": "demo123",
            "full_name": "Nisha Verma",
            "role": "Moderate Risk Applicant",
            "output": RiskAnalyzeResponse(
                risk_score=56,
                risk_grade="Moderate",
                utilization_rate=31.4,
                risk_factors=[
                    RiskFactor(
                        factor="Moderate debt-to-income burden",
                        impact="Medium",
                        value="31.4%",
                    ),
                    RiskFactor(
                        factor="Elevated interest rate",
                        impact="Medium",
                        value="14.25%",
                    ),
                ],
                portfolio_risk=PortfolioRiskSnapshot(
                    total_assets_inr=890000,
                    npc_rate_percent=4.2,
                    label="Portfolio Risk",
                ),
            ),
        },
        "rohan": {
            "password": "demo123",
            "full_name": "Rohan Mehta",
            "role": "High Risk Applicant",
            "output": RiskAnalyzeResponse(
                risk_score=86,
                risk_grade="High",
                utilization_rate=47.9,
                risk_factors=[
                    RiskFactor(
                        factor="High debt-to-income burden",
                        impact="High",
                        value="47.9%",
                    ),
                    RiskFactor(
                        factor="Previous default history",
                        impact="High",
                        value="Default flag on credit file",
                    ),
                    RiskFactor(
                        factor="Low loan grade",
                        impact="Medium",
                        value="F",
                    ),
                ],
                portfolio_risk=PortfolioRiskSnapshot(
                    total_assets_inr=890000,
                    npc_rate_percent=4.2,
                    label="Portfolio Risk",
                ),
            ),
        },
    }

    def login_demo_user(self, payload: DemoLoginRequest) -> DemoLoginResponse:
        record = self._demo_users.get(payload.username)
        if record is None or record["password"] != payload.password:
            raise HTTPException(status_code=401, detail="Invalid demo credentials")

        return DemoLoginResponse(
            message="Demo login successful",
            user=DemoUserProfile(
                username=payload.username,
                full_name=record["full_name"],
                role=record["role"],
            ),
            dashboard_preview=record["output"],
        )

    def list_demo_users(self) -> list[dict[str, str]]:
        return [
            {
                "username": key,
                "password": "demo123",
                "full_name": value["full_name"],
                "role": value["role"],
            }
            for key, value in self._demo_users.items()
        ]
