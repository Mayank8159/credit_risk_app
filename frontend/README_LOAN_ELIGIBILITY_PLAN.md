# Loan Eligibility Feature Plan (Frontend First)

## Objective
Build a complete frontend-first loan eligibility workflow with:
- Categorized loan selection
- CIBIL score input
- Salary-based prediction
- Loan amount demand form
- Risk and credit score display
- Bank selection
- EMI calculation and affordability output

## Scope
This plan focuses on frontend implementation first, with backend integration added after the UI and calculations are stable.

## User Flow
1. User opens the Loan Eligibility screen.
2. User selects loan category.
3. User enters CIBIL score, monthly salary, and requested loan amount.
4. User selects tenure and bank.
5. App computes local prediction and EMI instantly.
6. App displays risk, credit interpretation, and EMI breakdown.

## Form Fields
Required fields:
- Loan Category
- CIBIL Score (300-900)
- Monthly Salary (INR)
- Loan Amount Demand (INR)
- Tenure (months)
- Bank Selection

Optional field:
- Interest Rate (auto-filled from selected bank; can be editable if needed)

## Proposed Screen and Components
Create a new screen and reusable components:

- `LoanEligibilityScreen`
- `LoanCategorySelector`
- `BankSelector`
- `PredictionSummaryCard`
- `EmiBreakdownCard`

Reuse existing app design system elements where possible.

## State Model
Form state:
- `loanCategory`
- `cibilScore`
- `monthlySalary`
- `amountDemand`
- `tenureMonths`
- `selectedBank`
- `annualInterestRate`

Derived state:
- `emi`
- `totalPayable`
- `totalInterest`
- `emiToSalaryRatio`
- `riskScore`
- `riskBand`
- `creditBand`

## Calculation Rules

### EMI Formula
Use standard EMI formula:

EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)

Where:
- P = principal (loan amount)
- r = monthly interest rate (annualRate / 12 / 100)
- n = tenure in months

Also compute:
- Total Payable = EMI * n
- Total Interest = Total Payable - P
- EMI-to-Salary Ratio = EMI / Monthly Salary

### Credit Band Mapping
- 300-579: Poor
- 580-669: Fair
- 670-739: Good
- 740-799: Very Good
- 800-900: Excellent

### Risk Band Mapping
- 0-34: Low
- 35-69: Moderate
- 70-100: High

### Frontend Risk Inputs
Risk score should combine:
- CIBIL influence (higher CIBIL lowers risk)
- Salary affordability (high EMI-to-salary raises risk)
- Loan category multiplier
- Bank policy multiplier

## Suggested Constants
Add constants file for:
- Loan categories
- Bank list (name, default annual interest, policy multiplier)
- Risk thresholds and score bands

## Validation Rules
- CIBIL must be between 300 and 900
- Salary must be greater than 0
- Loan amount must be greater than 0
- Tenure must be valid and positive
- Bank and category are required

Disable calculate/submit button until validation passes.

## Implementation Sequence
1. Add constants and utility modules.
2. Build Loan Eligibility form UI.
3. Add field-level validations.
4. Implement EMI and risk calculation helpers.
5. Render prediction and EMI results.
6. Add reset and error handling states.
7. Add navigation entry in bottom tabs or as a dedicated route.
8. Polish responsive behavior for mobile and web.

## Backend Integration (Phase 2)
After frontend-first launch:
- Add service method for backend analysis endpoint.
- Keep local prediction as fallback.
- Prefer backend response when available.

## Testing Checklist
- Input validation tests for all fields
- EMI calculation tests with known values
- Risk band boundary tests
- Credit band boundary tests
- UI state tests (loading, reset, invalid inputs)

## Initial File Targets
Likely files to add/update in this codebase:
- `frontend/src/screens/LoanEligibilityScreen.js` (new)
- `frontend/src/components/LoanCategorySelector.js` (new)
- `frontend/src/components/BankSelector.js` (new)
- `frontend/src/components/PredictionSummaryCard.js` (new)
- `frontend/src/components/EmiBreakdownCard.js` (new)
- `frontend/src/constants/loanOptions.js` (new)
- `frontend/src/services/loanCalculator.js` (new)
- `frontend/src/navigation/AppTabs.js` (update)

## Done Criteria
Feature is complete when:
- User can enter complete loan request details.
- User can choose a bank and see interest-driven EMI changes.
- User can see risk and credit interpretation clearly.
- User can see EMI, total payable, and affordability ratio.
- Form behavior is validated and stable on frontend.
