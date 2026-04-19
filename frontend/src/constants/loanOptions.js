export const LOAN_CATEGORIES = [
  { key: "PERSONAL", label: "Personal", riskWeight: 1.12 },
  { key: "HOME", label: "Home", riskWeight: 0.9 },
  { key: "AUTO", label: "Auto", riskWeight: 1.0 },
  { key: "EDUCATION", label: "Education", riskWeight: 0.94 },
  { key: "BUSINESS", label: "Business", riskWeight: 1.18 },
];

export const BANK_OPTIONS = [
  { key: "HDFC", label: "HDFC Bank", annualRate: 10.4, policyWeight: 0.96 },
  { key: "ICICI", label: "ICICI Bank", annualRate: 10.8, policyWeight: 1.0 },
  { key: "SBI", label: "SBI", annualRate: 9.9, policyWeight: 0.92 },
  { key: "AXIS", label: "Axis Bank", annualRate: 11.2, policyWeight: 1.04 },
  { key: "KOTAK", label: "Kotak Mahindra", annualRate: 11.0, policyWeight: 1.02 },
];

export const CREDIT_BANDS = [
  { min: 300, max: 579, label: "Poor" },
  { min: 580, max: 669, label: "Fair" },
  { min: 670, max: 739, label: "Good" },
  { min: 740, max: 799, label: "Very Good" },
  { min: 800, max: 900, label: "Excellent" },
];

export const RISK_THRESHOLDS = {
  lowMax: 34,
  moderateMax: 69,
};

export const FORM_LIMITS = {
  cibilMin: 300,
  cibilMax: 900,
  salaryMin: 1,
  amountMin: 1000,
  tenureMin: 6,
  tenureMax: 360,
};
