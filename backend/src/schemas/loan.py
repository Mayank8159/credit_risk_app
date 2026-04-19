from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class LoanCategory(str, Enum):
    HOME = "HOME"
    CAR = "CAR"
    PERSONAL = "PERSONAL"
    EDUCATION = "EDUCATION"
    BUSINESS = "BUSINESS"


BankName = Literal["SBI", "HDFC", "ICICI", "Axis", "Kotak"]


class LoanCategoryInfo(BaseModel):
    loan_category: LoanCategory
    base_interest_rate: float = Field(..., ge=0, le=100)
    max_tenure: int = Field(..., ge=1)


class LoanApplyRequest(BaseModel):
    user_id: str | None = None
    loan_amount: float = Field(..., gt=0)
    loan_category: LoanCategory
    selected_bank: BankName
    salary: float = Field(..., gt=0)
    cibil_score: int = Field(..., ge=300, le=900)
    tenure: int = Field(..., ge=1)


class LoanApplicationRecord(BaseModel):
    id: str
    user_id: str | None = None
    loan_amount: float
    loan_category: LoanCategory
    selected_bank: BankName
    salary: float
    cibil_score: int
    risk_score: float = Field(..., ge=0, le=100)
    credit_score: float = Field(..., ge=0, le=100)
    emi: float = Field(..., ge=0)
    tenure: int = Field(..., ge=1)
    created_at: datetime


class LoanApplyResponse(BaseModel):
    success: bool = True
    data: dict


class LoanCategoriesResponse(BaseModel):
    success: bool = True
    data: dict


class LoanApplicationsResponse(BaseModel):
    success: bool = True
    data: dict
