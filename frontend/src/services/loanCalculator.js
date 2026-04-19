import { CREDIT_BANDS, RISK_THRESHOLDS } from "../constants/loanOptions";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getCreditBand(cibilScore) {
  const parsed = Number(cibilScore);
  const found = CREDIT_BANDS.find((band) => parsed >= band.min && parsed <= band.max);
  return found?.label || "Unknown";
}

export function calculateEmi(principal, annualRate, tenureMonths) {
  const p = Number(principal);
  const monthlyRate = Number(annualRate) / 12 / 100;
  const n = Number(tenureMonths);

  if (!Number.isFinite(p) || !Number.isFinite(monthlyRate) || !Number.isFinite(n) || p <= 0 || n <= 0) {
    return { emi: 0, totalPayable: 0, totalInterest: 0 };
  }

  if (monthlyRate === 0) {
    const emiNoRate = p / n;
    return {
      emi: Number(emiNoRate.toFixed(2)),
      totalPayable: Number((emiNoRate * n).toFixed(2)),
      totalInterest: 0,
    };
  }

  const factor = (1 + monthlyRate) ** n;
  const emi = (p * monthlyRate * factor) / (factor - 1);
  const totalPayable = emi * n;
  const totalInterest = totalPayable - p;

  return {
    emi: Number(emi.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
  };
}

function getRiskBand(score) {
  if (score <= RISK_THRESHOLDS.lowMax) {
    return "Low";
  }
  if (score <= RISK_THRESHOLDS.moderateMax) {
    return "Moderate";
  }
  return "High";
}

export function calculateLoanPrediction({
  cibilScore,
  monthlySalary,
  amountDemand,
  tenureMonths,
  annualInterestRate,
  categoryWeight,
  bankWeight,
}) {
  const emiResult = calculateEmi(amountDemand, annualInterestRate, tenureMonths);
  const safeSalary = Number(monthlySalary) || 0;
  const emiToSalaryRatio = safeSalary > 0 ? emiResult.emi / safeSalary : 0;

  const normalizedCibil = clamp((Number(cibilScore) - 300) / 600, 0, 1);
  const cibilRisk = (1 - normalizedCibil) * 100;
  const affordabilityRisk = clamp(emiToSalaryRatio / 0.55, 0, 1) * 100;
  const loanPressureRisk = clamp(Number(amountDemand) / Math.max(safeSalary * 24, 1), 0, 1) * 100;

  let weightedRisk = cibilRisk * 0.45 + affordabilityRisk * 0.4 + loanPressureRisk * 0.15;
  weightedRisk *= Number(categoryWeight) || 1;
  weightedRisk *= Number(bankWeight) || 1;

  const riskScore = Math.round(clamp(weightedRisk, 0, 100));
  const riskBand = getRiskBand(riskScore);
  const creditBand = getCreditBand(cibilScore);

  let affordabilityBand = "Comfortable";
  if (emiToSalaryRatio >= 0.5) {
    affordabilityBand = "Stressed";
  } else if (emiToSalaryRatio >= 0.35) {
    affordabilityBand = "Cautious";
  }

  return {
    ...emiResult,
    emiToSalaryRatio: Number((emiToSalaryRatio * 100).toFixed(2)),
    riskScore,
    riskBand,
    creditBand,
    affordabilityBand,
  };
}
