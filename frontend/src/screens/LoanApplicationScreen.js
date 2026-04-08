import { useEffect, useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  applyLoanApplication,
  getLoanApplications,
  getLoanCategories,
} from "../services/loanService";
import { useAppTheme } from "../theme/ThemeContext";

const BANK_OPTIONS = ["SBI", "HDFC", "ICICI", "Axis", "Kotak"];

function parsePositiveNumber(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function calculateMonthlyEmi(principal, annualRate, tenureMonths) {
  if (!principal || !annualRate || !tenureMonths) {
    return 0;
  }

  const monthlyRate = annualRate / (12 * 100);
  if (monthlyRate <= 0) {
    return principal / Math.max(tenureMonths, 1);
  }

  const pow = Math.pow(1 + monthlyRate, tenureMonths);
  const numerator = principal * monthlyRate * pow;
  const denominator = pow - 1;

  if (!denominator) {
    return principal / Math.max(tenureMonths, 1);
  }

  return numerator / denominator;
}

export default function LoanApplicationScreen({ session }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  const [categories, setCategories] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [latestResult, setLatestResult] = useState(null);

  const [loanAmount, setLoanAmount] = useState("");
  const [salary, setSalary] = useState("");
  const [cibilScore, setCibilScore] = useState("750");
  const [tenure, setTenure] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("HOME");
  const [selectedBank, setSelectedBank] = useState("SBI");

  const selectedCategoryInfo = useMemo(() => {
    return categories?.find((item) => item?.loan_category === selectedCategory) || null;
  }, [categories, selectedCategory]);

  const emiPreview = useMemo(() => {
    const amount = parsePositiveNumber(loanAmount);
    const term = Number(tenure);
    const rate = Number(selectedCategoryInfo?.base_interest_rate || 0);

    if (!amount || !term || term <= 0) {
      return 0;
    }

    return calculateMonthlyEmi(amount, rate, term);
  }, [loanAmount, tenure, selectedCategoryInfo]);

  async function loadLoanMeta() {
    try {
      setError("");
      const [categoryResponse, applicationsResponse] = await Promise.all([
        getLoanCategories(),
        getLoanApplications(),
      ]);
      setCategories(categoryResponse?.data?.categories || []);
      setApplications(applicationsResponse?.data?.applications || []);

      const firstCategory = categoryResponse?.data?.categories?.[0]?.loan_category;
      if (firstCategory) {
        setSelectedCategory(firstCategory);
      }
    } catch (err) {
      setError(err?.message || "Unable to load loan data");
    } finally {
      setLoadingMeta(false);
    }
  }

  useEffect(() => {
    loadLoanMeta();
  }, []);

  function validateForm() {
    const amount = parsePositiveNumber(loanAmount);
    if (!amount) {
      return "Enter a valid loan amount";
    }

    const monthlySalary = parsePositiveNumber(salary);
    if (!monthlySalary) {
      return "Enter a valid monthly salary";
    }

    const cibil = Number(cibilScore);
    if (!Number.isInteger(cibil) || cibil < 300 || cibil > 900) {
      return "CIBIL score must be between 300 and 900";
    }

    const term = Number(tenure);
    if (!Number.isInteger(term) || term <= 0) {
      return "Enter a valid tenure in months";
    }

    const maxTenure = Number(selectedCategoryInfo?.max_tenure || 0);
    if (maxTenure > 0 && term > maxTenure) {
      return `Tenure for ${selectedCategory} cannot exceed ${maxTenure} months`;
    }

    if (!selectedBank) {
      return "Please select a bank";
    }

    return "";
  }

  async function onSubmit() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      user_id: session?.user?.username || null,
      loan_amount: Number(loanAmount),
      loan_category: selectedCategory,
      selected_bank: selectedBank,
      salary: Number(salary),
      cibil_score: Number(cibilScore),
      tenure: Number(tenure),
    };

    try {
      setError("");
      setSuccessMessage("");
      setSaving(true);
      const response = await applyLoanApplication(payload);
      const created = response?.data?.application;

      if (created) {
        setApplications((prev) => [created, ...(prev || [])]);
        setLatestResult(created);
      }

      setSuccessMessage("Loan application saved successfully.");
    } catch (err) {
      setError(err?.message || "Unable to submit application");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <LinearGradient colors={theme.gradients.page} style={styles.gradientBackdrop} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.caption}>Loan Desk</Text>
        <View style={styles.titleRow}>
          <MaterialIcons name="assignment" size={28} color={theme.colors.textPrimary} />
          <Text style={styles.title}>Loan Application</Text>
        </View>

        {loadingMeta ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
            <Text style={styles.loaderText}>Loading categories and records...</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.sectionHeaderWithIcon}>
            <MaterialIcons name="settings" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.sectionTitle}>Choose Category</Text>
          </View>
          <View style={styles.chipWrap}>
            {(categories || []).map((item) => {
              const category = item?.loan_category;
              const isActive = category === selectedCategory;

              return (
                <Pressable
                  key={category}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{category}</Text>
                  <Text style={[styles.chipSubtext, isActive && styles.chipTextActive]}>
                    {item?.base_interest_rate}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hintText}>
            Interest: {selectedCategoryInfo?.base_interest_rate || "-"}% | Max tenure: {selectedCategoryInfo?.max_tenure || "-"} months
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderWithIcon}>
            <MaterialIcons name="account-balance" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.sectionTitle}>Application Details</Text>
          </View>

          <Text style={styles.inputLabel}>Loan Amount (INR)</Text>
          <TextInput
            value={loanAmount}
            onChangeText={setLoanAmount}
            keyboardType="numeric"
            style={styles.input}
            placeholder="e.g. 750000"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={styles.inputLabel}>Monthly Salary (INR)</Text>
          <TextInput
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            style={styles.input}
            placeholder="e.g. 90000"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={styles.inputLabel}>CIBIL Score (300 - 900)</Text>
          <TextInput
            value={cibilScore}
            onChangeText={setCibilScore}
            keyboardType="numeric"
            style={styles.input}
            placeholder="750"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={styles.inputLabel}>Tenure (months)</Text>
          <TextInput
            value={tenure}
            onChangeText={setTenure}
            keyboardType="numeric"
            style={styles.input}
            placeholder="e.g. 120"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={styles.inputLabel}>Select Bank</Text>
          <View style={styles.bankWrap}>
            {BANK_OPTIONS.map((bank) => {
              const active = bank === selectedBank;
              return (
                <Pressable
                  key={bank}
                  style={[styles.bankButton, active && styles.bankButtonActive]}
                  onPress={() => setSelectedBank(bank)}
                >
                  <Text style={[styles.bankButtonText, active && styles.bankButtonTextActive]}>
                    {bank}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.emiRow}>
            <View style={styles.metricLabelWrap}>
              <MaterialIcons name="trending-up" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.emiLabel}>Estimated EMI</Text>
            </View>
            <Text style={styles.emiValue}>₹{emiPreview.toFixed(2)}</Text>
          </View>

          <Pressable style={styles.submitButton} onPress={onSubmit} disabled={saving || loadingMeta}>
            <LinearGradient
              colors={theme.gradients.button}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.submitButtonGradient}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Apply and Save</Text>
              )}
            </LinearGradient>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
        </View>

        {latestResult ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Latest Decision Summary</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricTile}>
                <MaterialIcons name="analytics" size={18} color={theme.colors.accent} />
                <Text style={styles.metricLabel}>Risk Score</Text>
                <Text style={styles.metricValue}>{Number(latestResult?.risk_score || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.metricTile}>
                <MaterialIcons name="credit-card" size={18} color={theme.colors.accent} />
                <Text style={styles.metricLabel}>Credit Score</Text>
                <Text style={styles.metricValue}>{Number(latestResult?.credit_score || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.metricTile}>
                <MaterialIcons name="trending-up" size={18} color={theme.colors.accent} />
                <Text style={styles.metricLabel}>EMI</Text>
                <Text style={styles.metricValue}>₹{Number(latestResult?.emi || 0).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Saved Applications</Text>
          {(applications || []).length === 0 ? (
            <Text style={styles.emptyText}>No saved applications yet.</Text>
          ) : (
            (applications || []).map((item) => (
              <View key={item?.id} style={styles.applicationRow}>
                <View style={styles.applicationHead}>
                  <Text style={styles.applicationCategory}>{item?.loan_category || "-"}</Text>
                  <Text style={styles.applicationEmi}>EMI ₹{Number(item?.emi || 0).toFixed(2)}</Text>
                </View>
                <Text style={styles.applicationMeta}>
                  Amount ₹{Number(item?.loan_amount || 0).toLocaleString("en-IN")} | Bank {item?.selected_bank || "-"}
                </Text>
                <Text style={styles.applicationMeta}>
                  Risk {item?.risk_score || 0} | Credit {item?.credit_score || 0} | CIBIL {item?.cibil_score || 0}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    gradientBackdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 140,
      gap: 12,
    },
    caption: {
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontSize: 12,
      fontWeight: "700",
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 30,
      fontWeight: "800",
      marginLeft: 8,
      marginBottom: 2,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    sectionHeaderWithIcon: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    loaderWrap: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    loaderText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 14,
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 10,
    },
    chipWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      minWidth: 90,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      paddingVertical: 8,
      paddingHorizontal: 10,
      alignItems: "center",
    },
    chipActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.chipBg,
    },
    chipText: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    chipSubtext: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    chipTextActive: {
      color: theme.colors.chipText,
    },
    hintText: {
      marginTop: 10,
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    inputLabel: {
      color: theme.colors.textSecondary,
      marginBottom: 6,
      marginTop: 6,
      fontSize: 12,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      fontWeight: "600",
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.colors.textPrimary,
      fontSize: 14,
      backgroundColor: theme.colors.inputBg,
    },
    bankWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 4,
    },
    bankButton: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    bankButtonActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.chipBg,
    },
    bankButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "600",
    },
    bankButtonTextActive: {
      color: theme.colors.chipText,
    },
    emiRow: {
      marginTop: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    emiLabel: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      marginLeft: 6,
    },
    metricLabelWrap: {
      flexDirection: "row",
      alignItems: "center",
    },
    emiValue: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
    },
    submitButton: {
      marginTop: 12,
      borderRadius: 14,
      overflow: "hidden",
    },
    submitButtonGradient: {
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    submitButtonText: {
      color: "#ffffff",
      fontWeight: "700",
      fontSize: 14,
      letterSpacing: 0.4,
    },
    errorText: {
      marginTop: 10,
      color: theme.colors.danger,
      fontSize: 13,
      fontWeight: "600",
    },
    successText: {
      marginTop: 10,
      color: theme.colors.success,
      fontSize: 13,
      fontWeight: "600",
    },
    emptyText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontStyle: "italic",
    },
    applicationRow: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      padding: 10,
      marginTop: 8,
    },
    applicationHead: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    applicationCategory: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
    applicationEmi: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: "700",
    },
    applicationMeta: {
      marginTop: 4,
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    metricsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    metricTile: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      paddingVertical: 10,
      paddingHorizontal: 8,
      alignItems: "center",
    },
    metricLabel: {
      marginTop: 4,
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },
    metricValue: {
      marginTop: 4,
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "800",
      textAlign: "center",
    },
  });
}
