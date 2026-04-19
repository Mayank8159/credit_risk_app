from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from ..schemas.loan import LoanCategory


@dataclass(slots=True)
class LoanApplication:
    id: str
    user_id: str | None
    loan_amount: float
    loan_category: LoanCategory
    selected_bank: str
    salary: float
    cibil_score: int
    risk_score: float
    credit_score: float
    emi: float
    tenure: int
    created_at: datetime
