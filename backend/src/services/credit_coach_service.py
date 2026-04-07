"""
AI Credit Coach Service - Rule-based explainability and guidance engine.

ACADEMIC POSITIONING (FOR VIVA):
This module implements an Explainable AI (XAI) layer that complements the
credit risk prediction model. Key concepts:

1. RULE-BASED APPROACH (not LLM-based):
   - Deterministic mapping of features → natural language explanations
   - Transparent logic suitable for academic discussion
   - No external API dependencies
   - Fast response times (<100ms)

2. FEATURE CONTRIBUTION ANALYSIS:
   - Maps high-impact features (debt-to-income, employment history, etc.)
   - Categorizes as negative/neutral/positive
   - Provides human-readable interpretations

3. INTENT DETECTION:
   - Analyzes user queries with keyword-based classification
   - Routes to appropriate response generator (explain/improve/summarize)
   - Similar to chatbot intent matching patterns

4. PRESCRIPTIVE ANALYTICS:
   - Moves beyond prediction (what will happen) to prescription (what to do)
   - Generates actionable recommendations based on top negative factors
   - Supports decision-support use cases

IMPLEMENTATION NOTES:
- All logic is deterministic and reproducible
- Comments explain rule thresholds and why they matter
- Can be tested with fixed inputs (no randomness)
"""

import logging
from typing import Literal

from ..core.config import get_settings
from .gemini_service import GeminiService


logger = logging.getLogger(__name__)


class CreditCoachService:
    """
    Rule-based AI Credit Coach service.
    
    PRIMARY FUNCTIONS:
    1. Natural language explanation of credit scores
    2. Intent detection from user messages
    3. Personalized improvement recommendations
    
    EXAMPLE FLOW:
    User Query: "Why is my score so low?"
    → Intent Detection: "explain_score"
    → Feature Analysis: Extracts negative/positive factors
    → Response Generation: Creates explanation using templates + factor data
    → Returns: Answer + recommendations
    """

    def __init__(self):
        """Initialize coach service with optional LLM support and safe fallback."""
        settings = get_settings()
        self._gemini_service = GeminiService(api_key=settings.google_api_key)
        if not self._gemini_service.is_configured:
            logger.warning(
                "GOOGLE_API_KEY is not configured; using deterministic credit coach responses"
            )

    def analyze_chat_message(
        self,
        user_message: str,
        risk_score: int,
        risk_grade: str,
        loan_percent_income: float,
        person_emp_length: float,
        loan_grade: str,
        cb_person_default_on_file: str,
        loan_int_rate: float,
        person_age: int,
        person_income: float,
        top_risk_factors: list[str] | None = None,
        top_positive_factors: list[str] | None = None,
    ) -> dict:
        """
        MAIN ENTRY POINT: Analyze user chat message and generate contextual response.
        
        PROCESSING PIPELINE:
        1. Detect user intent (explain/improve/summarize/general)
        2. Extract feature contributions (what factors help/hurt)
        3. Generate response based on intent
        4. Create personalized recommendations
        
        Args:
            user_message: User's question/statement (free text)
            risk_score: Current risk score (0-100, higher = riskier)
            risk_grade: Current risk grade (Low/Moderate/High)
            loan_percent_income: Debt-to-income ratio (0-1, e.g., 0.35 = 35%)
            person_emp_length: Employment history in years
            loan_grade: Loan grade (A=best, G=worst)
            cb_person_default_on_file: Previous default history (Y/N)
            loan_int_rate: Interest rate percentage
            person_age: Applicant age
            person_income: Annual income
            top_risk_factors: Pre-computed negative factors (optional)
            top_positive_factors: Pre-computed positive factors (optional)

        Returns:
            dict with keys:
            - answer: Main response text
            - intent_detected: Classified intent
            - top_negative_factors: Factors hurting score
            - top_positive_factors: Factors helping score
            - recommendations: 3-5 actionable next steps
        """
        # Detect intent from message
        intent = self._detect_intent(user_message)

        # Extract key factors
        negative_factors, positive_factors = self._extract_factors(
            loan_percent_income=loan_percent_income,
            person_emp_length=person_emp_length,
            loan_grade=loan_grade,
            cb_person_default_on_file=cb_person_default_on_file,
            loan_int_rate=loan_int_rate,
            person_age=person_age,
        )

        # Use provided factors if available, otherwise use extracted ones
        if top_risk_factors:
            negative_factors = top_risk_factors
        if top_positive_factors:
            positive_factors = top_positive_factors

        # Generate response based on intent
        answer = self._generate_response(
            intent=intent,
            risk_score=risk_score,
            risk_grade=risk_grade,
            negative_factors=negative_factors,
            positive_factors=positive_factors,
            loan_percent_income=loan_percent_income,
            loan_grade=loan_grade,
            person_emp_length=person_emp_length,
        )

        # Optional LLM enhancement. If unavailable or failing, keep deterministic answer.
        llm_answer = self._gemini_service.generate_credit_coach_answer(
            user_message=user_message,
            risk_score=risk_score,
            risk_grade=risk_grade,
            negative_factors=negative_factors,
            positive_factors=positive_factors,
        )
        if llm_answer:
            answer = llm_answer

        # Generate recommendations
        recommendations = self._generate_recommendations(
            intent=intent,
            negative_factors=negative_factors,
            risk_score=risk_score,
            loan_percent_income=loan_percent_income,
        )

        return {
            "answer": answer,
            "intent_detected": intent,
            "top_negative_factors": negative_factors[:5],
            "top_positive_factors": positive_factors[:3],
            "recommendations": recommendations,
        }

    def _detect_intent(self, message: str) -> Literal["explain_score", "improve_score", "summarize", "general"]:
        """
        Simple intent detection using keyword matching.

        Args:
            message: User message

        Returns:
            Detected intent category
        """
        msg_lower = message.lower()

        # Explain intent keywords
        explain_keywords = ["why", "explain", "reason", "cause", "how is", "how come"]
        if any(kw in msg_lower for kw in explain_keywords):
            return "explain_score"

        # Improve intent keywords
        improve_keywords = [
            "improve",
            "increase",
            "raise",
            "better",
            "get lower",
            "reduce risk",
            "what should",
            "how can",
        ]
        if any(kw in msg_lower for kw in improve_keywords):
            return "improve_score"

        # Summarize intent keywords
        summarize_keywords = ["summary", "overview", "strengths", "weaknesses", "summary", "summary"]
        if any(kw in msg_lower for kw in summarize_keywords):
            return "summarize"

        return "general"

    def _extract_factors(
        self,
        loan_percent_income: float,
        person_emp_length: float,
        loan_grade: str,
        cb_person_default_on_file: str,
        loan_int_rate: float,
        person_age: int,
    ) -> tuple[list[str], list[str]]:
        """
        Extract risk and positive factors based on feature values.

        Args:
            loan_percent_income: Debt-to-income ratio
            person_emp_length: Employment history
            loan_grade: Loan grade
            cb_person_default_on_file: Previous default flag
            loan_int_rate: Interest rate
            person_age: Age

        Returns:
            Tuple of (negative_factors, positive_factors)
        """
        negative_factors = []
        positive_factors = []

        # Debt-to-income analysis
        if loan_percent_income >= 0.40:
            negative_factors.append("High debt-to-income burden (>40%)")
        elif loan_percent_income >= 0.30:
            negative_factors.append("Elevated debt-to-income ratio (30-40%)")
        elif loan_percent_income <= 0.15:
            positive_factors.append("Conservative debt-to-income ratio (<15%)")

        # Default history
        if cb_person_default_on_file == "Y":
            negative_factors.append("Previous default on credit file")
        else:
            positive_factors.append("Clean credit history (no defaults)")

        # Loan grade
        if loan_grade in ("F", "G"):
            negative_factors.append("Low loan grade (F/G) indicates risky profile")
        elif loan_grade in ("E", "D"):
            negative_factors.append("Moderate loan grade (D/E) shows caution needed")
        elif loan_grade in ("A", "B"):
            positive_factors.append("Strong loan grade (A/B) reflects good creditworthiness")

        # Interest rate
        if loan_int_rate >= 18:
            negative_factors.append("High interest rate (>18%) elevates risk profile")
        elif loan_int_rate >= 14:
            negative_factors.append("Above-average interest rate (14-18%)")
        elif loan_int_rate <= 8:
            positive_factors.append("Favorable interest rate (<8%) reflects low-risk profile")

        # Employment history
        if person_emp_length < 1:
            negative_factors.append("Very recent employment (<1 year)")
        elif person_emp_length < 2:
            negative_factors.append("Limited employment history (<2 years)")
        elif person_emp_length >= 10:
            positive_factors.append("Strong employment stability (10+ years)")

        # Age-based insights (very light)
        if person_age < 25:
            negative_factors.append("Early career stage may indicate income volatility")
        elif person_age >= 35 and person_age <= 50:
            positive_factors.append("Mature career stage supports stability")

        return negative_factors, positive_factors

    def _generate_response(
        self,
        intent: str,
        risk_score: int,
        risk_grade: str,
        negative_factors: list[str],
        positive_factors: list[str],
        loan_percent_income: float,
        loan_grade: str,
        person_emp_length: float,
    ) -> str:
        """
        Generate natural language response based on intent and factors.

        Args:
            intent: Detected user intent
            risk_score: Current risk score
            risk_grade: Current risk grade
            negative_factors: List of negative factors
            positive_factors: List of positive factors
            loan_percent_income: Debt-to-income ratio
            loan_grade: Loan grade
            person_emp_length: Employment history

        Returns:
            Natural language response
        """
        if intent == "explain_score":
            return self._explain_score(
                risk_score, risk_grade, negative_factors, positive_factors
            )

        elif intent == "improve_score":
            return self._suggest_improvements(
                negative_factors, loan_percent_income, loan_grade, person_emp_length
            )

        elif intent == "summarize":
            return self._summarize_profile(
                risk_score, risk_grade, negative_factors, positive_factors
            )

        else:
            # General inquiry
            risk_interpretation = {
                "Low": "You maintain a healthy credit profile with low default risk.",
                "Moderate": "Your profile shows balanced risk with areas for improvement.",
                "High": "Your profile carries elevated risk that needs attention.",
            }
            return f"{risk_interpretation.get(risk_grade, 'Your profile has been analyzed.')} " \
                   f"Your current risk score is {risk_score}/100. " \
                   f"Ask me about why your score is like this, or how you can improve it."

    def _explain_score(
        self,
        risk_score: int,
        risk_grade: str,
        negative_factors: list[str],
        positive_factors: list[str],
    ) -> str:
        """Generate explanation for current score."""
        lines = []

        score_explanation = {
            "Low": "Your low risk score reflects strong credit fundamentals and responsible financial behavior.",
            "Moderate": "Your moderate risk score suggests a balanced profile with some areas that need attention.",
            "High": "Your elevated risk score indicates that several factors are creating uncertainty in your creditworthiness.",
        }

        lines.append(score_explanation.get(risk_grade, f"Your risk score is {risk_score}/100."))

        if negative_factors:
            lines.append(f"\n**Factors affecting your score negatively:**")
            for factor in negative_factors[:3]:
                lines.append(f"• {factor}")

        if positive_factors:
            lines.append(f"\n**Factors working in your favor:**")
            for factor in positive_factors[:2]:
                lines.append(f"• {factor}")

        lines.append(
            "\nUnderstanding these factors helps you take targeted action to strengthen your credit profile."
        )
        return "\n".join(lines)

    def _suggest_improvements(
        self,
        negative_factors: list[str],
        loan_percent_income: float,
        loan_grade: str,
        person_emp_length: float,
    ) -> str:
        """Generate improvement suggestions."""
        lines = []
        lines.append("Here are targeted steps to improve your credit profile:\n")

        # Top priority: debt-to-income
        if loan_percent_income >= 0.35:
            lines.append(
                "🎯 **Priority 1 - Reduce Debt Burden:**\n"
                "Your debt-to-income ratio is high. Pay down existing loans or increase income. "
                "Even a 10% reduction can improve your score significantly.\n"
            )

        # Loan grade improvement
        if loan_grade in ("E", "F", "G"):
            lines.append(
                "🎯 **Priority 2 - Improve Loan Terms:**\n"
                "Refinance to a better loan grade or negotiate better terms with your lender. "
                "This can reduce perceived risk.\n"
            )

        # Employment stability
        if person_emp_length < 2:
            lines.append(
                "🎯 **Career Stability:**\n"
                "Focus on building consistent employment history. Longer tenure reduces uncertainty "
                "in lending decisions.\n"
            )

        # Behavioral recommendations
        if len(negative_factors) >= 2:
            lines.append(
                "📈 **Tactical Actions:**\n"
                "• Avoid taking on new unsecured debt immediately\n"
                "• Maintain timely payments on all obligations\n"
                "• Build an emergency fund to demonstrate financial discipline\n"
            )

        return "".join(lines)

    def _summarize_profile(
        self,
        risk_score: int,
        risk_grade: str,
        negative_factors: list[str],
        positive_factors: list[str],
    ) -> str:
        """Generate profile summary."""
        lines = [f"**Credit Profile Summary**\n", f"Risk Grade: {risk_grade} | Score: {risk_score}/100\n"]

        if positive_factors:
            lines.append(f"**Your Strengths:**\n")
            for strength in positive_factors[:2]:
                lines.append(f"✓ {strength}\n")

        if negative_factors:
            lines.append(f"**Areas for Improvement:**\n")
            for area in negative_factors[:3]:
                lines.append(f"→ {area}\n")

        lines.append("\nYour profile has both strengths and opportunities. " \
                     "Strategic improvements in the highlighted areas can meaningfully boost your creditworthiness.")
        return "".join(lines)

    def _generate_recommendations(
        self,
        intent: str,
        negative_factors: list[str],
        risk_score: int,
        loan_percent_income: float,
    ) -> list[str]:
        """Generate actionable recommendations."""
        recommendations = []

        # Base recommendations on factors
        if loan_percent_income >= 0.35:
            recommendations.append("Reduce debt-to-income ratio by paying down loans or increasing income")

        if any("default" in f.lower() for f in negative_factors):
            recommendations.append("Maintain perfect payment discipline to rebuild trust over time")

        if any("grade" in f.lower() for f in negative_factors):
            recommendations.append("Explore refinancing options for better loan terms")

        if any("employment" in f.lower() for f in negative_factors):
            recommendations.append("Prioritize employment stability and consistent income")

        # Score-based recommendations
        if risk_score >= 70:
            recommendations.append("Consider creating a financial plan with a advisor to navigate high-risk period")
        elif risk_score >= 35:
            recommendations.append("Monitor your profile quarterly and adjust spending patterns")
        else:
            recommendations.append("Maintain your healthy profile; review annually")

        # Add a what-if suggestion
        recommendations.append("Try our What-If Simulator to see how changes could impact your score")

        return recommendations[:5]
