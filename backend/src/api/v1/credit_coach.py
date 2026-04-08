"""
Credit Coach API Endpoints.

Provides two main endpoints:
- POST /credit-coach/chat: Conversational assistant for credit guidance
- POST /credit-coach/what-if: What-if scenario simulation
"""

import logging

from fastapi import APIRouter, HTTPException

from ...schemas.credit_coach import (
    CoachChatApiResponse,
    CoachChatRequest,
    CoachChatResponse,
    WhatIfApiResponse,
    WhatIfRequest,
    WhatIfResponse,
)
from ...services.credit_coach_service import CreditCoachService
from ...services.counterfactual_service import CounterfactualService

router = APIRouter(prefix="/credit-coach", tags=["credit-coach"])
logger = logging.getLogger(__name__)

# Initialize services
_coach_service: CreditCoachService | None = None
_counterfactual_service: CounterfactualService | None = None


def configure_services(
    coach_service: CreditCoachService,
    counterfactual_service: CounterfactualService,
) -> None:
    """Configure the provided services."""
    global _coach_service, _counterfactual_service
    _coach_service = coach_service
    _counterfactual_service = counterfactual_service


def get_coach_service() -> CreditCoachService:
    """Get the coach service or raise error if not configured."""
    if _coach_service is None:
        raise RuntimeError("Credit Coach service was not initialized.")
    return _coach_service


def get_counterfactual_service() -> CounterfactualService:
    """Get the counterfactual service or raise error if not configured."""
    if _counterfactual_service is None:
        raise RuntimeError("Counterfactual service was not initialized.")
    return _counterfactual_service


@router.post("/chat", response_model=CoachChatApiResponse)
def chat_with_coach(
    request: CoachChatRequest,
) -> CoachChatApiResponse:
    """
    Chat endpoint for conversational credit guidance.

    Accepts a user message and credit profile context, returns
    natural language guidance, identified intent, top factors, and recommendations.

    Example request:
    {
        "user_message": "Why is my score so low?",
        "risk_score": 75,
        "risk_grade": "High",
        "loan_percent_income": 0.42,
        ...
    }
    """
    try:
        coach_service = get_coach_service()

        result = coach_service.analyze_chat_message(
            user_message=request.user_message,
            risk_score=request.risk_score,
            risk_grade=request.risk_grade,
            loan_percent_income=request.loan_percent_income,
            person_emp_length=request.person_emp_length,
            loan_grade=request.loan_grade,
            cb_person_default_on_file=request.cb_person_default_on_file,
            loan_int_rate=request.loan_int_rate,
            person_age=request.person_age,
            person_income=request.person_income,
            top_risk_factors=request.top_risk_factors or None,
            top_positive_factors=request.top_positive_factors or None,
        )

        response = CoachChatResponse(
            answer=result["answer"],
            intent_detected=result["intent_detected"],
            top_negative_factors=result["top_negative_factors"],
            top_positive_factors=result["top_positive_factors"],
            recommendations=result["recommendations"],
        )
        return CoachChatApiResponse(success=True, data=response.model_dump())

    except Exception as exc:
        logger.exception("Credit coach chat failed")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Unable to process coach chat right now.",
                "detail": str(exc),
            },
        ) from exc


@router.post("/what-if", response_model=WhatIfApiResponse)
def simulate_what_if(
    request: WhatIfRequest,
) -> WhatIfApiResponse:
    """
    What-If simulator endpoint for counterfactual analysis.

    Accepts current credit profile and hypothetical modifications,
    returns estimated impact on risk score/grade and recommendations.

    Example request:
    {
        "risk_score": 75,
        "risk_grade": "High",
        "loan_percent_income": 0.42,
        "hypothetical_loan_percent_income": 0.25,
        ...
    }

    Returns estimated new score, grade, impact level, and actionable recommendations.
    """
    try:
        counterfactual_service = get_counterfactual_service()

        result = counterfactual_service.simulate_scenario(
            original_risk_score=request.risk_score,
            original_risk_grade=request.risk_grade,
            original_loan_percent_income=request.loan_percent_income,
            original_person_emp_length=request.person_emp_length,
            original_loan_grade=request.loan_grade,
            original_cb_person_default_on_file=request.cb_person_default_on_file,
            original_loan_int_rate=request.loan_int_rate,
            original_person_age=request.person_age,
            original_person_income=request.person_income,
            hypothetical_loan_percent_income=request.hypothetical_loan_percent_income,
            hypothetical_person_emp_length=request.hypothetical_person_emp_length,
            hypothetical_loan_grade=request.hypothetical_loan_grade,
            hypothetical_loan_int_rate=request.hypothetical_loan_int_rate,
        )

        response = WhatIfResponse(
            original_risk_score=result["original_risk_score"],
            original_risk_grade=result["original_risk_grade"],
            estimated_risk_score=result["estimated_risk_score"],
            estimated_risk_grade=result["estimated_risk_grade"],
            score_change=result["score_change"],
            grade_change=result["grade_change"],
            changed_factors=result["changed_factors"],
            impact_level=result["impact_level"],
            impact_summary=result["impact_summary"],
            recommendations=result["recommendations"],
        )
        return WhatIfApiResponse(success=True, data=response.model_dump())

    except Exception as exc:
        logger.exception("Credit coach what-if simulation failed")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Unable to run what-if simulation right now.",
                "detail": str(exc),
            },
        ) from exc
