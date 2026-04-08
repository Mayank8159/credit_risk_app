import { apiRequest } from "./apiClient";

export function getLoanCategories() {
  return apiRequest("/loan/categories", { retry: 1 }).then((payload) => ({
    success: payload?.success ?? true,
    data: {
      categories: payload?.data?.categories || payload?.categories || [],
    },
  }));
}

export function applyLoanApplication(payload) {
  return apiRequest("/loan/apply", {
    method: "POST",
    data: payload,
    retry: 1,
  }).then((response) => ({
    success: response?.success ?? true,
    data: {
      application: response?.data?.application || response?.application,
      loan_to_income_ratio:
        response?.data?.loan_to_income_ratio ?? response?.loan_to_income_ratio,
    },
  }));
}

export function getLoanApplications() {
  return apiRequest("/loan/applications", { retry: 1 }).then((payload) => ({
    success: payload?.success ?? true,
    data: {
      applications: payload?.data?.applications || payload?.applications || [],
    },
  }));
}
