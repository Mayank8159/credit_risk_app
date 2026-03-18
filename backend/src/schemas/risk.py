from typing import Literal

from pydantic import BaseModel, Field


HomeOwnership = Literal["RENT", "OWN", "MORTGAGE", "OTHER"]
LoanIntent = Literal[
    "PERSONAL",
    "EDUCATION",
    "MEDICAL",
    "VENTURE",
    "HOMEIMPROVEMENT",
    "DEBTCONSOLIDATION",
]
LoanGrade = Literal["A", "B", "C", "D", "E", "F", "G"]
DefaultFlag = Literal["Y", "N"]
RiskGrade = Literal["Low", "Moderate", "High"]


class RiskAnalyzeRequest(BaseModel):
    person_age: int = Field(..., ge=18, le=100)
    person_income: float = Field(..., gt=0)
    person_home_ownership: HomeOwnership
    person_emp_length: float = Field(..., ge=0, le=60)
    loan_intent: LoanIntent
    loan_grade: LoanGrade
    loan_amnt: float = Field(..., gt=0)
    loan_int_rate: float = Field(..., ge=0, le=100)
    loan_percent_income: float = Field(..., ge=0, le=1)
    cb_person_default_on_file: DefaultFlag
    cb_person_cred_hist_length: float = Field(..., ge=0)


class RiskFactor(BaseModel):
    factor: str
    impact: Literal["Low", "Medium", "High"]
    value: str


class PortfolioRiskSnapshot(BaseModel):
    total_assets_usd: int
    npc_rate_percent: float
    label: str


class RiskAnalyzeResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    risk_grade: RiskGrade
    utilization_rate: float = Field(..., ge=0)
    risk_factors: list[RiskFactor]
    portfolio_risk: PortfolioRiskSnapshot
