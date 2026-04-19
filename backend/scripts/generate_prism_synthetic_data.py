import numpy as np
import pandas as pd
from pathlib import Path


def compute_emi(principal: np.ndarray, annual_rate_pct: np.ndarray, tenure_months: np.ndarray) -> np.ndarray:
    """Compute EMI using the standard amortization formula."""
    monthly_rate = (annual_rate_pct / 12.0) / 100.0
    n = tenure_months.astype(float)
    p = principal.astype(float)

    emi = np.zeros_like(p, dtype=float)
    near_zero_rate = np.isclose(monthly_rate, 0.0)

    emi[near_zero_rate] = p[near_zero_rate] / np.maximum(n[near_zero_rate], 1.0)

    active = ~near_zero_rate
    factor = np.power(1.0 + monthly_rate[active], n[active])
    denominator = np.maximum(factor - 1.0, 1e-12)
    emi[active] = p[active] * monthly_rate[active] * factor / denominator

    return emi


def generate_dataset(n_rows: int = 40000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    loan_categories = np.array(["Personal", "Home", "Auto", "Education", "Business"])
    tenure_choices = np.array([9, 12, 24, 36, 48, 60])

    person_age = rng.integers(21, 61, size=n_rows)

    # Right-skewed salary distribution (log-normal), clipped to requested limits.
    monthly_salary = rng.lognormal(mean=10.85, sigma=0.6, size=n_rows)
    monthly_salary = np.clip(monthly_salary, 15000, 300000)

    loan_category = rng.choice(
        loan_categories,
        size=n_rows,
        p=[0.36, 0.22, 0.17, 0.13, 0.12],
    )

    loan_tenure_months = rng.choice(
        tenure_choices,
        size=n_rows,
        p=[0.08, 0.12, 0.24, 0.28, 0.16, 0.12],
    )

    category_rate_shift = {
        "Personal": 1.2,
        "Home": -1.0,
        "Auto": 0.0,
        "Education": -0.4,
        "Business": 1.4,
    }
    rate_shift = np.vectorize(category_rate_shift.get)(loan_category)
    bank_roi = 11.3 + rate_shift + rng.normal(0.0, 1.8, size=n_rows)
    bank_roi = np.clip(bank_roi, 8.5, 18.0)

    # CIBIL distribution centered around mid-good scores with realistic spread.
    cibil_score = rng.normal(685, 95, size=n_rows)
    cibil_score = np.clip(cibil_score, 300, 900).round().astype(int)

    person_home_ownership = rng.choice(
        np.array(["RENT", "OWN", "MORTGAGE", "OTHER"]),
        size=n_rows,
        p=[0.44, 0.18, 0.34, 0.04],
    )

    # Employment length bounded by legal working-age horizon.
    max_emp_years = np.maximum(person_age - 18, 0)
    person_emp_length = np.minimum(
        rng.gamma(shape=2.4, scale=2.2, size=n_rows),
        max_emp_years,
    )
    person_emp_length = np.round(person_emp_length, 2)

    # Income computed strictly from monthly salary.
    person_income = monthly_salary * 12.0

    # Loan amount correlated with salary and category while respecting hard bounds.
    base_multiplier = rng.uniform(3.0, 22.0, size=n_rows)
    category_amt_shift = {
        "Personal": 0.8,
        "Home": 3.0,
        "Auto": 1.6,
        "Education": 1.1,
        "Business": 2.2,
    }
    amt_shift = np.vectorize(category_amt_shift.get)(loan_category)
    raw_loan_amnt = monthly_salary * (base_multiplier + amt_shift)
    raw_loan_amnt *= rng.uniform(0.85, 1.2, size=n_rows)
    loan_amnt = np.clip(raw_loan_amnt, 50000, 5000000)

    monthly_emi = compute_emi(loan_amnt, bank_roi, loan_tenure_months)
    emi_to_salary_ratio = monthly_emi / np.maximum(monthly_salary, 1.0)

    # More stressed borrowers tend to have weaker savings profiles.
    savings_base = rng.beta(2.0, 5.0, size=n_rows)
    savings_to_expense_ratio = 0.05 + savings_base * 0.55
    savings_to_expense_ratio -= np.clip(emi_to_salary_ratio - 0.35, 0, 1) * 0.12
    savings_to_expense_ratio = np.clip(savings_to_expense_ratio, 0.05, 0.60)

    # Late-night spend ratio with small increase for younger users and high EMI pressure.
    night_base = rng.beta(1.5, 8.0, size=n_rows) * 0.4
    night_transaction_ratio = night_base + np.clip((35 - person_age) / 250.0, 0, 0.06)
    night_transaction_ratio += np.clip(emi_to_salary_ratio - 0.45, 0, 0.10)
    night_transaction_ratio = np.clip(night_transaction_ratio, 0.0, 0.4)

    # Prior default probability correlated with CIBIL and repayment pressure.
    default_file_prob = 0.07 + (cibil_score < 580) * 0.18 + (emi_to_salary_ratio > 0.55) * 0.10
    default_file_prob = np.clip(default_file_prob, 0.03, 0.55)
    cb_person_default_on_file = rng.binomial(1, default_file_prob, size=n_rows)
    cb_person_default_on_file_yn = np.where(cb_person_default_on_file == 1, "Y", "N")

    loan_intent_map = {
        "Personal": "PERSONAL",
        "Home": "HOMEIMPROVEMENT",
        "Auto": "VENTURE",
        "Education": "EDUCATION",
        "Business": "VENTURE",
    }
    loan_intent = np.vectorize(loan_intent_map.get)(loan_category)

    loan_grade = np.where(
        cibil_score >= 800,
        "A",
        np.where(
            cibil_score >= 740,
            "B",
            np.where(
                cibil_score >= 670,
                "C",
                np.where(
                    cibil_score >= 620,
                    "D",
                    np.where(cibil_score >= 560, "E", np.where(cibil_score >= 500, "F", "G")),
                ),
            ),
        ),
    )

    cb_person_cred_hist_length = np.maximum(person_age - 18 + rng.normal(0.0, 1.3, size=n_rows), 0)
    cb_person_cred_hist_length = np.round(np.clip(cb_person_cred_hist_length, 0, 45), 2)

    # Strict target construction as requested.
    probability_default = np.full(n_rows, 0.10, dtype=float)
    probability_default += (emi_to_salary_ratio > 0.50) * 0.40
    probability_default += (cibil_score < 550) * 0.30
    probability_default += (savings_to_expense_ratio < 0.15) * 0.15
    probability_default += (cb_person_default_on_file == 1) * 0.25
    probability_default -= ((cibil_score > 750) & (emi_to_salary_ratio < 0.30)) * 0.30

    # Guard against edge cases before drawing labels.
    probability_default = np.clip(probability_default, 0.0, 1.0)
    loan_status = rng.binomial(1, probability_default, size=n_rows)

    df = pd.DataFrame(
        {
            "person_age": person_age.astype(int),
            "monthly_salary": np.round(monthly_salary, 2),
            "person_income": np.round(person_income, 2),
            "loan_amnt": np.round(loan_amnt, 2),
            "loan_tenure_months": loan_tenure_months.astype(int),
            "loan_category": loan_category,
            "bank_roi": np.round(bank_roi, 2),
            "cibil_score": cibil_score.astype(int),
            "monthly_emi": np.round(monthly_emi, 2),
            "emi_to_salary_ratio": np.round(emi_to_salary_ratio, 6),
            "savings_to_expense_ratio": np.round(savings_to_expense_ratio, 6),
            "night_transaction_ratio": np.round(night_transaction_ratio, 6),
            "cb_person_default_on_file": cb_person_default_on_file.astype(int),

            # Backend model-compatible feature aliases for immediate training/inference integration.
            "person_home_ownership": person_home_ownership,
            "person_emp_length": person_emp_length,
            "loan_intent": loan_intent,
            "loan_grade": loan_grade,
            "loan_int_rate": np.round(bank_roi, 2),
            "loan_percent_income": np.round(np.clip(loan_amnt / np.maximum(person_income, 1.0), 0, 1), 6),
            "cb_person_default_on_file_yn": cb_person_default_on_file_yn,
            "cb_person_cred_hist_length": cb_person_cred_hist_length,
            "loan_status": loan_status.astype(int),
        }
    )

    # Enforce strict person_income rule after any potential rounding/path changes.
    df["person_income"] = np.round(df["monthly_salary"] * 12.0, 2)

    return df


def main() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    output_file = backend_dir / "datasets" / "prism_synthetic_credit_data_40k.csv"
    training_dataset_file = backend_dir / "datasets" / "credit_risk_dataset.csv"
    df = generate_dataset(n_rows=40000, seed=42)
    df.to_csv(output_file, index=False)

    # Training pipeline expects this default dataset path.
    training_df = df.copy()
    training_df["cb_person_default_on_file"] = training_df["cb_person_default_on_file_yn"]
    training_df.to_csv(training_dataset_file, index=False)

    print(f"Saved {len(df):,} rows to {output_file}")
    print(f"Updated training dataset at: {training_dataset_file}")
    print("Default rate:", round(df["loan_status"].mean(), 4))
    print("Columns:", ", ".join(df.columns))


if __name__ == "__main__":
    main()