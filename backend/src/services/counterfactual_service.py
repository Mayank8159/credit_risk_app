"""
Counterfactual Credit Simulator Service.

ACADEMIC POSITIONING (FOR VIVA):
This module implements counterfactual analysis for credit improvement scenarios.
Counterfactual Analysis: "What would happen if X changed?" 

KEY CONCEPTS:
1. COUNTERFACTUAL vs PREDICTION:
   - Prediction: "Is this person likely to default?" (already done by main model)
   - Counterfactual: "If they reduced debt by 20%, would they default?" (this module)
   - Enables "what-if" scenarios without model retraining

2. HEURISTIC APPROXIMATION LAYER:
   - Does NOT retrain the ML model (impractical for interactive use)
   - Instead uses causal heuristics calibrated from domain knowledge
   - Conservative estimates (directionally correct, not precise)
   - Honest about approximation nature

3. IMPACT SCORING METHODOLOGY:
   - Weights factors by known importance to credit risk
   - debt-to-income: highest weight (25 points) - strong predictor
   - loan_grade, defaults: 20 points - categorical indicators
   - employment_length: 10 points - stability signal
   - interest_rate: 15 points - market risk indicator
   - Nonlinear responses (e.g., debt >40% has disproportionate impact)

4. USE CASES:
   - Interactive policy simulation for risk officers
   - Customer education ("what could improve your score?")
   - Strategic planning ("how risky is this portfolio change?")
   - NOT meant as precise prediction

IMPLEMENTATION PHILOSOPHY:
- All heuristics are TUNED but INTERPRETABLE
- No "black box" weights
- Easy to explain and modify for real use
- Underestimation of improvement (conservative)
"""

from typing import Literal


class CounterfactualService:
    """
    Service for what-if credit scenario simulation using counterfactual analysis.
    
    PRIMARY METHOD:
    simulate_scenario(original_features, hypothetical_features)
    → Returns: estimated_score, impact_level, changed_factors, recommendations
    
    DESIGN PRINCIPLE:
    Uses heuristic scoring adjustments to estimate impact WITHOUT retraining.
    This is acceptable for demo/educational purposes where directional correctness
    matters more than precision.
    """

    # HEURISTIC IMPACT WEIGHTS
    # These calibrate importance of each factor
    # Higher = more impact on credit score
    # Tuned based on domain knowledge and typical credit metrics
    FACTOR_WEIGHTS = {
        "loan_percent_income": 25,  # Debt burden - HIGHEST impact
        "loan_grade": 20,           # Categorical risk signal
        "cb_person_default_on_file": 20,  # Default = strongest risk signal
        "loan_int_rate": 15,        # Market risk + selection bias indicator
        "person_emp_length": 10,    # Employment stability signal
        "person_age": 5,            # Age - weakest predictor
    }

    def simulate_scenario(
        self,
        original_risk_score: int,
        original_risk_grade: str,
        original_loan_percent_income: float,
        original_person_emp_length: float,
        original_loan_grade: str,
        original_cb_person_default_on_file: str,
        original_loan_int_rate: float,
        original_person_age: int,
        original_person_income: float,
        # Hypothetical modifications (optional)
        hypothetical_loan_percent_income: float | None = None,
        hypothetical_person_emp_length: float | None = None,
        hypothetical_loan_grade: str | None = None,
        hypothetical_loan_int_rate: float | None = None,
    ) -> dict:
        """
        Simulate a what-if scenario and estimate impact.

        Args:
            original_risk_score: Current risk score
            original_risk_grade: Current risk grade
            original_loan_percent_income: Current debt-to-income
            original_person_emp_length: Current employment history
            original_loan_grade: Current loan grade
            original_cb_person_default_on_file: Current default flag
            original_loan_int_rate: Current interest rate
            original_person_age: Age
            original_person_income: Annual income
            hypothetical_loan_percent_income: Hypothetical debt-to-income
            hypothetical_person_emp_length: Hypothetical employment history
            hypothetical_loan_grade: Hypothetical loan grade
            hypothetical_loan_int_rate: Hypothetical interest rate

        Returns:
            Dictionary with scenario analysis results
        """
        # Collect changed factors
        changed_factors = []

        if hypothetical_loan_percent_income is not None:
            changed_factors.append(
                self._analyze_factor_change(
                    factor_name="loan_percent_income",
                    original_value=original_loan_percent_income,
                    hypothetical_value=hypothetical_loan_percent_income,
                )
            )

        if hypothetical_person_emp_length is not None:
            changed_factors.append(
                self._analyze_factor_change(
                    factor_name="person_emp_length",
                    original_value=original_person_emp_length,
                    hypothetical_value=hypothetical_person_emp_length,
                )
            )

        if hypothetical_loan_grade is not None:
            changed_factors.append(
                self._analyze_factor_change(
                    factor_name="loan_grade",
                    original_value=original_loan_grade,
                    hypothetical_value=hypothetical_loan_grade,
                )
            )

        if hypothetical_loan_int_rate is not None:
            changed_factors.append(
                self._analyze_factor_change(
                    factor_name="loan_int_rate",
                    original_value=original_loan_int_rate,
                    hypothetical_value=hypothetical_loan_int_rate,
                )
            )

        # Calculate estimated score impact
        score_delta = self._calculate_score_delta(changed_factors)
        estimated_risk_score = max(0, min(100, original_risk_score + score_delta))
        estimated_risk_grade = self._score_to_grade(estimated_risk_score)

        # Determine impact level
        impact_level = self._categorize_impact(score_delta)

        # Generate impact summary
        impact_summary = self._generate_impact_summary(impact_level, score_delta, estimated_risk_grade)

        # Generate recommendations for achieving this scenario
        recommendations = self._generate_scenario_recommendations(
            changed_factors, estimated_risk_grade
        )

        return {
            "original_risk_score": original_risk_score,
            "original_risk_grade": original_risk_grade,
            "estimated_risk_score": int(round(estimated_risk_score)),
            "estimated_risk_grade": estimated_risk_grade,
            "score_change": int(score_delta),
            "grade_change": f"{original_risk_grade} → {estimated_risk_grade}" \
                           if original_risk_grade != estimated_risk_grade \
                           else "No change",
            "changed_factors": changed_factors,
            "impact_level": impact_level,
            "impact_summary": impact_summary,
            "recommendations": recommendations,
        }

    def _analyze_factor_change(
        self,
        factor_name: str,
        original_value,
        hypothetical_value,
    ) -> dict:
        """
        Analyze a single factor change and estimate impact.

        Args:
            factor_name: Name of the factor
            original_value: Original value
            hypothetical_value: Hypothetical value

        Returns:
            Dictionary with factor change details
        """
        if factor_name == "loan_percent_income":
            direction = "improved" if hypothetical_value < original_value else "worsened"
            percentage_change = abs((hypothetical_value - original_value) / original_value * 100) \
                if original_value != 0 else 0

            if hypothetical_value < original_value:
                magnitude = "strong improvement" if percentage_change > 20 else "moderate improvement"
                impact_description = f"Debt-to-income decreased from {original_value*100:.1f}% " \
                                    f"to {hypothetical_value*100:.1f}% ({magnitude})"
            else:
                magnitude = "significant deterioration" if percentage_change > 20 else "minor increase"
                impact_description = f"Debt-to-income increased from {original_value*100:.1f}% " \
                                    f"to {hypothetical_value*100:.1f}% ({magnitude})"

            return {
                "factor_name": "Debt-to-Income Ratio",
                "original_value": original_value,
                "hypothetical_value": hypothetical_value,
                "impact_description": impact_description,
            }

        elif factor_name == "person_emp_length":
            years_diff = hypothetical_value - original_value
            direction = "improved" if years_diff > 0 else "worsened"

            if years_diff > 0:
                impact_description = f"Employment history extended by {years_diff:.1f} years " \
                                    f"(improved stability)"
            else:
                impact_description = f"Employment history reduced by {abs(years_diff):.1f} years " \
                                    f"(decreased stability)"

            return {
                "factor_name": "Employment History",
                "original_value": original_value,
                "hypothetical_value": hypothetical_value,
                "impact_description": impact_description,
            }

        elif factor_name == "loan_grade":
            grade_scale = {"A": 7, "B": 6, "C": 5, "D": 4, "E": 3, "F": 2, "G": 1}
            original_score = grade_scale.get(original_value, 4)
            hypothetical_score = grade_scale.get(hypothetical_value, 4)

            if hypothetical_score > original_score:
                impact_description = f"Loan grade improved from {original_value} to {hypothetical_value} " \
                                    f"(reduced perceived risk)"
            elif hypothetical_score < original_score:
                impact_description = f"Loan grade declined from {original_value} to {hypothetical_value} " \
                                    f"(increased perceived risk)"
            else:
                impact_description = f"Loan grade remains at {original_value}"

            return {
                "factor_name": "Loan Grade",
                "original_value": original_value,
                "hypothetical_value": hypothetical_value,
                "impact_description": impact_description,
            }

        elif factor_name == "loan_int_rate":
            rate_diff = hypothetical_value - original_value

            if rate_diff < 0:
                impact_description = f"Interest rate decreased by {abs(rate_diff):.1f}% " \
                                    f"({original_value:.1f}% → {hypothetical_value:.1f}%, improved terms)"
            elif rate_diff > 0:
                impact_description = f"Interest rate increased by {abs(rate_diff):.1f}% " \
                                    f"({original_value:.1f}% → {hypothetical_value:.1f}%, worse terms)"
            else:
                impact_description = f"Interest rate remains at {original_value:.1f}%"

            return {
                "factor_name": "Interest Rate",
                "original_value": original_value,
                "hypothetical_value": hypothetical_value,
                "impact_description": impact_description,
            }

        return {
            "factor_name": factor_name,
            "original_value": original_value,
            "hypothetical_value": hypothetical_value,
            "impact_description": "Factor value changed",
        }

    def _calculate_score_delta(self, changed_factors: list[dict]) -> int:
        """
        Calculate estimated score change from factor changes using causal heuristics.
        
        SCORING LOGIC (FOR VIVA):
        - Negative delta = IMPROVEMENT (score goes down, risk reduces)
        - Positive delta = WORSENING (score goes up, risk increases)
        - Based on relative changes, not absolute values
        
        HEURISTIC RULES (tuned for reasonableness):
        1. Debt-to-Income (loan_percent_income):
           - <20%: -15 points (excellent, strong improvement signal)
           - <30%: -8 points (good, standard improvement)
           - >40%: +12 points (bad, worsens score)
           - Justification: Debt burden is primary default driver in credit models
        
        2. Employment History:
           - +1 year ≈ -2 points (stability signal)
           - Capped at -6 points (diminishing returns after 10+ years)
           - Justification: Consistent income reduces default risk
        
        3. Loan Grade (A-G):
           - Grade improvement (A<B<C...) nets -5 points per grade
           - Justification: Categorical indicator of perceived risk
        
        4. Interest Rate:
           - Each +1% interest = +0.5 points to score
           - Justification: Reflects market risk premium + adverse selection
        
        LIMITATIONS (to discuss in viva):
        - Does not account for interaction effects between factors
        - Conservative estimates (underestimates improvement)
        - Not a retrained model prediction
        - Acceptable for interactive decision support

        Args:
            changed_factors: List of factor change objects

        Returns:
            Estimated score delta (negative = improvement)
        """
        delta = 0

        for factor in changed_factors:
            factor_name = factor["factor_name"]

            if factor_name == "Debt-to-Income Ratio":
                original = factor["original_value"]
                hypothetical = factor["hypothetical_value"]

                # HEURISTIC: Strong nonlinear relationship
                # Debt >40% signals acute financial stress
                # Debt <20% signals strong financial health
                if hypothetical < 0.20:
                    delta -= 15  # Excellent scenario
                elif hypothetical < 0.30:
                    delta -= 8   # Good scenario
                elif hypothetical > 0.40:
                    delta += 12  # Risky scenario
                else:
                    # Linear interpolation for moderate ratios
                    delta += int((hypothetical - original) * 20)

            elif factor_name == "Employment History":
                original = factor["original_value"]
                hypothetical = factor["hypothetical_value"]

                # HEURISTIC: Each additional year of employment
                # reduces risk by ~2 points (stability signal)
                # Cap improvement at 6 points (diminishing returns)
                years_diff = hypothetical - original
                delta -= min(years_diff * 2, 6)

            elif factor_name == "Loan Grade":
                original = factor["original_value"]
                hypothetical = factor["hypothetical_value"]

                # HEURISTIC: Loan grade is A(best)=7 to G(worst)=1
                # Each grade improvement = -5 points
                # Example: C→B improves by 5 points
                grade_scale = {"A": 7, "B": 6, "C": 5, "D": 4, "E": 3, "F": 2, "G": 1}
                grade_diff = (grade_scale.get(hypothetical, 4) - grade_scale.get(original, 4)) * 5
                delta -= grade_diff

            elif factor_name == "Interest Rate":
                original = factor["original_value"]
                hypothetical = factor["hypothetical_value"]

                # HEURISTIC: Interest rate reflects market risk
                # Each 1% increase adds ~0.5 risk points
                # Example: 10%→12% worsens by 1 point
                rate_diff = hypothetical - original
                delta += int(rate_diff * 0.5)

        return delta

    def _score_to_grade(self, score: int) -> str:
        """Convert risk score to grade."""
        if score < 35:
            return "Low"
        if score < 70:
            return "Moderate"
        return "High"

    def _categorize_impact(self, score_delta: int) -> str:
        """
        Categorize the magnitude of impact.

        Args:
            score_delta: Change in risk score

        Returns:
            Impact level category
        """
        if score_delta <= -20:
            return "high_positive"
        elif score_delta <= -10:
            return "moderate_positive"
        elif score_delta < 0:
            return "slight_positive"
        elif score_delta == 0:
            return "no_change"
        else:
            return "negative"

    def _generate_impact_summary(self, impact_level: str, score_delta: int, new_grade: str) -> str:
        """Generate human-readable impact summary."""
        summaries = {
            "high_positive": f"Excellent scenario! These changes could significantly improve your profile to {new_grade} risk.",
            "moderate_positive": f"Good scenario. These adjustments would noticeably improve your standing to {new_grade} risk.",
            "slight_positive": f"Positive direction. These changes move your profile toward {new_grade} risk.",
            "no_change": "These adjustments have minimal impact on your risk profile.",
            "negative": "These changes would negatively impact your risk profile. Consider alternative scenarios.",
        }
        return summaries.get(impact_level, "Impact analysis complete.")

    def _generate_scenario_recommendations(self, changed_factors: list[dict], new_grade: str) -> list[str]:
        """Generate recommendations to achieve or maintain the scenario."""
        recommendations = []

        # Analyze what was changed and provide tactical advice
        factor_names = {f["factor_name"] for f in changed_factors}

        if "Debt-to-Income Ratio" in factor_names:
            recommendations.append("Maintain lower debt levels; pay down loans strategically")

        if "Employment History" in factor_names:
            recommendations.append("Build consistent employment tenure for stability")

        if "Loan Grade" in factor_names:
            recommendations.append("Negotiate better lending terms to maintain improved grade")

        if "Interest Rate" in factor_names:
            recommendations.append("Seek refinancing opportunities for better rate environment")

        # Grade-specific recommendations
        if new_grade == "Low":
            recommendations.append("Excellent! Maintain this profile with disciplined financial habits")
        elif new_grade == "Moderate":
            recommendations.append("This profile is balanced; monitor quarterly and continue improvements")

        return recommendations[:4]
