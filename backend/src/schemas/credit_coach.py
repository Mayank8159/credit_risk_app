"""
Pydantic schemas for AI Credit Coach feature.
Covers chat interactions and what-if scenario simulation.
"""

from typing import Literal

from pydantic import BaseModel, Field


# ============================================================================
# Chat Request/Response Schemas
# ============================================================================


class CoachChatRequest(BaseModel):
    """
    Request for AI coach chat endpoint.
    Contains user message and current credit profile context.
    """

    user_message: str = Field(..., min_length=1, max_length=500)
    """User's question or statement"""

    risk_score: int = Field(..., ge=0, le=100)
    """Current credit risk score"""

    risk_grade: Literal["Low", "Moderate", "High"]
    """Current risk grade"""

    # Feature context - extracted from latest analysis
    loan_percent_income: float = Field(..., ge=0, le=1)
    """Debt-to-income ratio"""

    person_emp_length: float = Field(..., ge=0, le=60)
    """Employment history in years"""

    loan_grade: Literal["A", "B", "C", "D", "E", "F", "G"]
    """Loan grade"""

    cb_person_default_on_file: Literal["Y", "N"]
    """Previous default history"""

    loan_int_rate: float = Field(..., ge=0, le=100)
    """Interest rate percentage"""

    person_age: int = Field(..., ge=18, le=100)
    """Age of applicant"""

    person_income: float = Field(..., gt=0)
    """Annual income"""

    # Optional: Feature contributions (if available from SHAP)
    top_risk_factors: list[str] = Field(default_factory=list)
    """List of top negative factors"""

    top_positive_factors: list[str] = Field(default_factory=list)
    """List of top positive factors"""


class CoachChatResponse(BaseModel):
    """Response from AI coach chat endpoint."""

    answer: str = Field(..., description="Natural language response to user")
    """Main conversational response"""

    intent_detected: Literal["explain_score", "improve_score", "summarize", "general"] = Field(
        ..., description="Detected user intent"
    )
    """Categorized intent of the user query"""

    top_negative_factors: list[str] = Field(default_factory=list)
    """Top 3-5 negative factors affecting score"""

    top_positive_factors: list[str] = Field(default_factory=list)
    """Top 2-3 positive factors"""

    recommendations: list[str] = Field(default_factory=list)
    """Actionable recommendations (3-5 items)"""


# ============================================================================
# What-If Simulator Schemas
# ============================================================================


class WhatIfScenario(BaseModel):
    """Represents a single hypothetical what-if scenario."""

    factor_name: str = Field(..., description="Name of factor being changed")
    original_value: float
    hypothetical_value: float
    impact_description: str = Field(..., description="Human-readable impact explanation")


class WhatIfRequest(BaseModel):
    """
    Request for what-if scenario simulation.
    Contains current state and hypothetical modifications.
    """

    # Current state (original features)
    risk_score: int = Field(..., ge=0, le=100)
    risk_grade: Literal["Low", "Moderate", "High"]
    loan_percent_income: float = Field(..., ge=0, le=1)
    person_emp_length: float = Field(..., ge=0)
    loan_grade: Literal["A", "B", "C", "D", "E", "F", "G"]
    cb_person_default_on_file: Literal["Y", "N"]
    loan_int_rate: float = Field(..., ge=0, le=100)
    person_age: int = Field(..., ge=18, le=100)
    person_income: float = Field(..., gt=0)

    # Hypothetical modifications
    # All optional - only changed factors are provided
    hypothetical_loan_percent_income: float | None = Field(None, ge=0, le=1)
    hypothetical_person_emp_length: float | None = Field(None, ge=0)
    hypothetical_loan_grade: Literal["A", "B", "C", "D", "E", "F", "G"] | None = None
    hypothetical_loan_int_rate: float | None = Field(None, ge=0, le=100)


class WhatIfResponse(BaseModel):
    """Response for what-if scenario simulation."""

    # Original summary
    original_risk_score: int
    original_risk_grade: Literal["Low", "Moderate", "High"]

    # Hypothetical summary
    estimated_risk_score: int
    estimated_risk_grade: Literal["Low", "Moderate", "High"]

    # Change analysis
    score_change: int = Field(..., description="Delta score (negative is improvement)")
    grade_change: str = Field(..., description="e.g., 'High → Moderate' or 'No change'")

    # Individual factor changes
    changed_factors: list[WhatIfScenario]

    # Impact interpretation
    impact_level: Literal["high_positive", "moderate_positive", "slight_positive", "no_change", "negative"]

    impact_summary: str = Field(..., description="Human-readable impact summary")

    recommendations: list[str] = Field(default_factory=list)
    """Actionable next steps to achieve this scenario"""


# ============================================================================
# Shared Data Models
# ============================================================================


class FactorContribution(BaseModel):
    """Representation of a single factor and its contribution."""

    factor: str
    contribution: Literal["negative", "neutral", "positive"]
    magnitude: Literal["low", "medium", "high"]
    explanation: str
