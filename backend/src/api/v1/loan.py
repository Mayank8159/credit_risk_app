import logging

from fastapi import APIRouter, Depends, HTTPException

from ...models.inference import CreditRiskInferenceService
from ...models.loan_application import LoanApplication
from ...schemas.loan import (
    LoanApplicationsResponse,
    LoanApplyRequest,
    LoanApplyResponse,
    LoanApplicationRecord,
    LoanCategoriesResponse,
)
from ...services.loan_repository import LoanApplicationRepository
from ...services.loan_service import LoanService

router = APIRouter(prefix="/loan", tags=["loan"])
logger = logging.getLogger(__name__)

_inference_service: CreditRiskInferenceService | None = None
_loan_repository: LoanApplicationRepository | None = None


def configure_dependencies(
    inference_service: CreditRiskInferenceService,
    loan_repository: LoanApplicationRepository,
) -> None:
    global _inference_service, _loan_repository
    _inference_service = inference_service
    _loan_repository = loan_repository


def get_loan_service() -> LoanService:
    if _inference_service is None or _loan_repository is None:
        raise RuntimeError("Loan module dependencies were not initialized")
    return LoanService(repository=_loan_repository, inference_service=_inference_service)


def _to_record(application: LoanApplication) -> LoanApplicationRecord:
    return LoanApplicationRecord(
        id=application.id,
        user_id=application.user_id,
        loan_amount=application.loan_amount,
        loan_category=application.loan_category,
        selected_bank=application.selected_bank,
        salary=application.salary,
        cibil_score=application.cibil_score,
        risk_score=application.risk_score,
        credit_score=application.credit_score,
        emi=application.emi,
        tenure=application.tenure,
        created_at=application.created_at,
    )


@router.post("/apply", response_model=LoanApplyResponse)
def apply_for_loan(
    payload: LoanApplyRequest,
    service: LoanService = Depends(get_loan_service),
) -> LoanApplyResponse:
    try:
        application, loan_to_income_ratio = service.apply(payload)
        return LoanApplyResponse(
            success=True,
            data={
                "application": _to_record(application).model_dump(),
                "loan_to_income_ratio": round(loan_to_income_ratio, 4),
            },
        )
    except ValueError as exc:
        logger.warning("Loan application validation failed: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover
        logger.exception("Loan application processing failed")
        raise HTTPException(status_code=500, detail="Unable to process loan request") from exc


@router.get("/categories", response_model=LoanCategoriesResponse)
def get_loan_categories(
    service: LoanService = Depends(get_loan_service),
) -> LoanCategoriesResponse:
    try:
        categories = [item.model_dump() for item in service.list_categories()]
        return LoanCategoriesResponse(success=True, data={"categories": categories})
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover
        logger.exception("Unable to fetch loan categories")
        raise HTTPException(status_code=500, detail="Unable to fetch categories") from exc


@router.get("/applications", response_model=LoanApplicationsResponse)
def get_loan_applications(
    service: LoanService = Depends(get_loan_service),
) -> LoanApplicationsResponse:
    try:
        records = [_to_record(item) for item in service.list_applications()]
        return LoanApplicationsResponse(
            success=True,
            data={"applications": [item.model_dump() for item in records]},
        )
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover
        logger.exception("Unable to fetch loan applications")
        raise HTTPException(status_code=500, detail="Unable to fetch applications") from exc
