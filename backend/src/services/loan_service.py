from __future__ import annotations

import math
from datetime import datetime, timezone
from uuid import uuid4

from ..models.inference import CreditRiskInferenceService
from ..models.loan_application import LoanApplication
from ..schemas.loan import LoanApplyRequest, LoanCategory, LoanCategoryInfo
from .loan_repository import LoanApplicationRepository


class LoanService:
    CATEGORY_CONFIG: dict[LoanCategory, dict[str, float | int]] = {
        LoanCategory.HOME: {"base_interest_rate": 8.0, "max_tenure": 360},
        LoanCategory.CAR: {"base_interest_rate": 10.0, "max_tenure": 84},
        LoanCategory.PERSONAL: {"base_interest_rate": 14.0, "max_tenure": 60},
        LoanCategory.EDUCATION: {"base_interest_rate": 9.0, "max_tenure": 120},
        LoanCategory.BUSINESS: {"base_interest_rate": 16.0, "max_tenure": 180},
    }

    def __init__(
        self,
        repository: LoanApplicationRepository,
        inference_service: CreditRiskInferenceService,
    ) -> None:
        self.repository = repository
        self.inference_service = inference_service

    def list_categories(self) -> list[LoanCategoryInfo]:
        return [
            LoanCategoryInfo(
                loan_category=category,
                base_interest_rate=float(config["base_interest_rate"]),
                max_tenure=int(config["max_tenure"]),
            )
            for category, config in self.CATEGORY_CONFIG.items()
        ]

    def apply(self, request: LoanApplyRequest) -> tuple[LoanApplication, float]:
        category_config = self.CATEGORY_CONFIG[request.loan_category]
        max_tenure = int(category_config["max_tenure"])
        if request.tenure > max_tenure:
            raise ValueError(
                f"Tenure for {request.loan_category.value} cannot exceed {max_tenure} months"
            )

        base_interest_rate = float(category_config["base_interest_rate"])
        loan_to_income_ratio = request.loan_amount / (request.salary * 12)

        try:
            model_probability = self.inference_service.predict_default_probability(
                feature_payload=self._build_inference_payload(request, base_interest_rate)
            )
        except Exception:
            # Keep loan flows available even when model artifact is missing or cold.
            model_probability = self._fallback_default_probability(
                loan_to_income_ratio=loan_to_income_ratio,
                cibil_score=request.cibil_score,
            )
        model_risk_score = self._clamp(model_probability * 100)

        adjusted_risk = self._apply_income_ratio_risk_adjustment(
            model_risk_score=model_risk_score,
            loan_to_income_ratio=loan_to_income_ratio,
        )

        normalized_cibil = self._normalize_cibil(request.cibil_score)
        credit_score = self._clamp((0.6 * adjusted_risk) + (0.4 * normalized_cibil))

        emi = self._calculate_emi(
            principal=request.loan_amount,
            annual_rate=base_interest_rate,
            tenure_months=request.tenure,
        )

        application = LoanApplication(
            id=str(uuid4()),
            user_id=request.user_id,
            loan_amount=request.loan_amount,
            loan_category=request.loan_category,
            selected_bank=request.selected_bank,
            salary=request.salary,
            cibil_score=request.cibil_score,
            risk_score=round(adjusted_risk, 2),
            credit_score=round(credit_score, 2),
            emi=round(emi, 2),
            tenure=request.tenure,
            created_at=datetime.now(timezone.utc),
        )

        return self.repository.create(application), loan_to_income_ratio

    def list_applications(self) -> list[LoanApplication]:
        return self.repository.list_all()

    def _build_inference_payload(
        self,
        request: LoanApplyRequest,
        base_interest_rate: float,
    ) -> dict[str, float | int | str]:
        return {
            "person_age": 30,
            "person_income": request.salary * 12,
            "person_home_ownership": "RENT",
            "person_emp_length": 5,
            "loan_intent": "PERSONAL",
            "loan_grade": "C",
            "loan_amnt": request.loan_amount,
            "loan_int_rate": base_interest_rate,
            "loan_percent_income": self._clamp(request.loan_amount / (request.salary * 12), 0.0, 1.0),
            "cb_person_default_on_file": "N",
            "cb_person_cred_hist_length": 6,
        }

    @staticmethod
    def _normalize_cibil(cibil_score: int) -> float:
        return ((cibil_score - 300) / 600) * 100

    @staticmethod
    def _apply_income_ratio_risk_adjustment(
        model_risk_score: float,
        loan_to_income_ratio: float,
    ) -> float:
        if loan_to_income_ratio >= 0.5:
            penalty = 15
        elif loan_to_income_ratio >= 0.35:
            penalty = 8
        elif loan_to_income_ratio >= 0.2:
            penalty = 3
        else:
            penalty = 0
        return LoanService._clamp(model_risk_score + penalty)

    @staticmethod
    def _fallback_default_probability(
        loan_to_income_ratio: float,
        cibil_score: int,
    ) -> float:
        ratio_component = min(max(loan_to_income_ratio, 0.0), 1.5) / 1.5
        cibil_component = 1 - ((cibil_score - 300) / 600)
        blended = (0.7 * ratio_component) + (0.3 * cibil_component)
        return max(0.0, min(1.0, blended))

    @staticmethod
    def _calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
        monthly_rate = annual_rate / (12 * 100)
        if monthly_rate <= 0:
            return principal / max(tenure_months, 1)

        rate_power = math.pow(1 + monthly_rate, tenure_months)
        numerator = principal * monthly_rate * rate_power
        denominator = rate_power - 1
        if denominator == 0:
            return principal / max(tenure_months, 1)
        return numerator / denominator

    @staticmethod
    def _clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
        return max(minimum, min(value, maximum))
