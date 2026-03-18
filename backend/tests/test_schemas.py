from pydantic import ValidationError
import pytest

from src.schemas.risk import RiskAnalyzeRequest


def test_risk_analyze_request_valid_payload() -> None:
    payload = RiskAnalyzeRequest(
        person_age=30,
        person_income=72000,
        person_home_ownership="RENT",
        person_emp_length=5,
        loan_intent="PERSONAL",
        loan_grade="B",
        loan_amnt=12000,
        loan_int_rate=11.4,
        loan_percent_income=0.17,
        cb_person_default_on_file="N",
        cb_person_cred_hist_length=8,
    )

    assert payload.person_age == 30
    assert payload.loan_grade == "B"


def test_risk_analyze_request_invalid_percent_income() -> None:
    with pytest.raises(ValidationError):
        RiskAnalyzeRequest(
            person_age=30,
            person_income=72000,
            person_home_ownership="RENT",
            person_emp_length=5,
            loan_intent="PERSONAL",
            loan_grade="B",
            loan_amnt=12000,
            loan_int_rate=11.4,
            loan_percent_income=1.5,
            cb_person_default_on_file="N",
            cb_person_cred_hist_length=8,
        )
