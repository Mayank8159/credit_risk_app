import logging

from fastapi import APIRouter, Depends, HTTPException

from ...models.inference import CreditRiskInferenceService
from ...schemas.risk import (
    RiskAnalyzeApiResponse,
    RiskAnalyzeRequest,
    RiskAnalyzeResponse,
    RiskFactor,
)
from ...services.portfolio import MockPortfolioRiskRepository

router = APIRouter(prefix="/risk", tags=["risk-analysis"])
_inference_service: CreditRiskInferenceService | None = None
logger = logging.getLogger(__name__)


def configure_inference_service(service: CreditRiskInferenceService) -> None:
    global _inference_service
    _inference_service = service


def get_inference_service() -> CreditRiskInferenceService:
    if _inference_service is None:
        raise RuntimeError("Inference service dependency was not initialized.")
    return _inference_service


def get_portfolio_repository() -> MockPortfolioRiskRepository:
    return MockPortfolioRiskRepository()


def _build_risk_factors(payload: RiskAnalyzeRequest) -> list[RiskFactor]:
    factors: list[RiskFactor] = []

    if payload.loan_percent_income >= 0.35:
        factors.append(
            RiskFactor(
                factor="High debt-to-income burden",
                impact="High",
                value=f"{payload.loan_percent_income * 100:.1f}%",
            )
        )

    if payload.cb_person_default_on_file == "Y":
        factors.append(
            RiskFactor(
                factor="Previous default history",
                impact="High",
                value="Default flag on credit file",
            )
        )

    if payload.loan_grade in {"E", "F", "G"}:
        factors.append(
            RiskFactor(
                factor="Low loan grade",
                impact="Medium",
                value=payload.loan_grade,
            )
        )

    if payload.loan_int_rate >= 16:
        factors.append(
            RiskFactor(
                factor="Elevated interest rate",
                impact="Medium",
                value=f"{payload.loan_int_rate:.2f}%",
            )
        )

    if payload.person_emp_length < 2:
        factors.append(
            RiskFactor(
                factor="Limited employment history",
                impact="Low",
                value=f"{payload.person_emp_length:.1f} years",
            )
        )

    if not factors:
        factors.append(
            RiskFactor(
                factor="Stable baseline profile",
                impact="Low",
                value="No critical indicators detected",
            )
        )

    return factors


def _grade_from_score(score: int) -> str:
    if score < 35:
        return "Low"
    if score < 70:
        return "Moderate"
    return "High"


@router.post("/analyze", response_model=RiskAnalyzeApiResponse)
def analyze_credit_risk(
    payload: RiskAnalyzeRequest,
    inference_service: CreditRiskInferenceService = Depends(get_inference_service),
    portfolio_repository: MockPortfolioRiskRepository = Depends(get_portfolio_repository),
) -> RiskAnalyzeApiResponse:
    try:
        probability = inference_service.predict_default_probability(
            feature_payload=payload.model_dump()
        )
        risk_score = int(round(probability * 100))
        utilization_rate = round((payload.loan_amnt / payload.person_income) * 100, 2)

        response = RiskAnalyzeResponse(
            risk_score=risk_score,
            risk_grade=_grade_from_score(risk_score),
            utilization_rate=utilization_rate,
            risk_factors=_build_risk_factors(payload),
            portfolio_risk=portfolio_repository.get_portfolio_risk_snapshot(),
        )
        return RiskAnalyzeApiResponse(success=True, data=response.model_dump())
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover
        logger.exception("Risk analysis failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
