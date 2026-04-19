import { useMemo, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BankSelector from "../components/BankSelector";
import EmiBreakdownCard from "../components/EmiBreakdownCard";
import LoanCategorySelector from "../components/LoanCategorySelector";
import PredictionSummaryCard from "../components/PredictionSummaryCard";
import {
  BANK_OPTIONS,
  FORM_LIMITS,
  LOAN_CATEGORIES,
} from "../constants/loanOptions";
import { calculateLoanPrediction } from "../services/loanCalculator";
import { analyzeRisk } from "../services/riskService";
import { useAppTheme } from "../theme/ThemeContext";

const EMPTY_FORM = {
  loanCategory: LOAN_CATEGORIES[0].key,
  cibilScore: "",
  monthlySalary: "",
  amountDemand: "",
  tenureMonths: "36",
  selectedBank: BANK_OPTIONS[0].key,
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getValidationErrors(form) {
  const errors = {};
  const cibil = toNumber(form.cibilScore);
  const salary = toNumber(form.monthlySalary);
  const amount = toNumber(form.amountDemand);
  const tenure = toNumber(form.tenureMonths);

  if (!form.loanCategory) {
    errors.loanCategory = "Select a loan category";
  }

  if (cibil < FORM_LIMITS.cibilMin || cibil > FORM_LIMITS.cibilMax) {
    errors.cibilScore = `CIBIL must be between ${FORM_LIMITS.cibilMin} and ${FORM_LIMITS.cibilMax}`;
  }

  if (salary < FORM_LIMITS.salaryMin) {
    errors.monthlySalary = "Monthly salary must be greater than 0";
  }

  if (amount < FORM_LIMITS.amountMin) {
    errors.amountDemand = `Loan amount must be at least INR ${FORM_LIMITS.amountMin}`;
  }

  if (tenure < FORM_LIMITS.tenureMin || tenure > FORM_LIMITS.tenureMax) {
    errors.tenureMonths = `Tenure must be between ${FORM_LIMITS.tenureMin} and ${FORM_LIMITS.tenureMax} months`;
  }

  if (!form.selectedBank) {
    errors.selectedBank = "Select a bank";
  }

  return errors;
}

function mapLoanIntent(loanCategory) {
  const mapping = {
    PERSONAL: "PERSONAL",
    HOME: "HOMEIMPROVEMENT",
    AUTO: "VENTURE",
    EDUCATION: "EDUCATION",
    BUSINESS: "VENTURE",
  };

  return mapping[loanCategory] || "PERSONAL";
}

function mapLoanGradeFromCibil(cibilScore) {
  const cibil = Number(cibilScore);
  if (cibil >= 800) {
    return "A";
  }
  if (cibil >= 740) {
    return "B";
  }
  if (cibil >= 670) {
    return "C";
  }
  if (cibil >= 620) {
    return "D";
  }
  if (cibil >= 560) {
    return "E";
  }
  if (cibil >= 500) {
    return "F";
  }
  return "G";
}

function buildRiskAnalyzePayload(form, bank) {
  const income = toNumber(form.monthlySalary) * 12;
  const loanAmount = toNumber(form.amountDemand);

  return {
    person_age: 32,
    person_income: income,
    person_home_ownership: "RENT",
    person_emp_length: 5,
    loan_intent: mapLoanIntent(form.loanCategory),
    loan_grade: mapLoanGradeFromCibil(form.cibilScore),
    loan_amnt: loanAmount,
    loan_int_rate: bank?.annualRate || 11,
    loan_percent_income: Math.min(loanAmount / Math.max(income, 1), 1),
    cb_person_default_on_file: toNumber(form.cibilScore) < 550 ? "Y" : "N",
    cb_person_cred_hist_length: 6,
  };
}

function getImpactTone(theme, impact) {
  if (impact === "High") {
    return theme.colors.danger;
  }
  if (impact === "Medium") {
    return theme.colors.warning;
  }
  return theme.colors.success;
}

export default function LoanEligibilityScreen() {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [result, setResult] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [showAllFactors, setShowAllFactors] = useState(false);

  const category = useMemo(
    () => LOAN_CATEGORIES.find((item) => item.key === form.loanCategory),
    [form.loanCategory]
  );

  const bank = useMemo(
    () => BANK_OPTIONS.find((item) => item.key === form.selectedBank),
    [form.selectedBank]
  );

  const errors = useMemo(() => getValidationErrors(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const sortedFactors = useMemo(() => {
    const factors = Array.isArray(result?.riskFactors) ? result.riskFactors : [];
    const severityRank = { High: 0, Medium: 1, Low: 2 };

    return [...factors].sort((a, b) => {
      const rankA = severityRank[a?.impact] ?? 99;
      const rankB = severityRank[b?.impact] ?? 99;
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return String(a?.factor || "").localeCompare(String(b?.factor || ""));
    });
  }, [result]);

  const visibleFactors = showAllFactors ? sortedFactors : sortedFactors.slice(0, 3);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onBlur(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  async function onCalculate() {
    setTouched({
      loanCategory: true,
      cibilScore: true,
      monthlySalary: true,
      amountDemand: true,
      tenureMonths: true,
      selectedBank: true,
    });

    if (!isValid || !category || !bank) {
      return;
    }

    const localPrediction = calculateLoanPrediction({
      cibilScore: toNumber(form.cibilScore),
      monthlySalary: toNumber(form.monthlySalary),
      amountDemand: toNumber(form.amountDemand),
      tenureMonths: toNumber(form.tenureMonths),
      annualInterestRate: bank.annualRate,
      categoryWeight: category.riskWeight,
      bankWeight: bank.policyWeight,
    });

    setResult({
      ...localPrediction,
      dataSource: "local",
      utilizationRate: Number(localPrediction.emiToSalaryRatio),
      riskFactors: [],
    });
    setShowAllFactors(false);
    setApiMessage("");

    try {
      setApiLoading(true);
      const payload = buildRiskAnalyzePayload(form, bank);
      const liveResult = await analyzeRisk(payload);

      setResult({
        ...localPrediction,
        riskScore: liveResult.risk_score,
        riskBand: liveResult.risk_grade,
        utilizationRate: liveResult.utilization_rate,
        riskFactors: liveResult.risk_factors || [],
        dataSource: "live",
      });
      setShowAllFactors(false);
      setApiMessage("Live backend risk analysis applied.");
    } catch (error) {
      setApiMessage(error?.message || "Backend unavailable, using local calculator fallback.");
    } finally {
      setApiLoading(false);
    }
  }

  function onReset() {
    setForm(EMPTY_FORM);
    setTouched({});
    setResult(null);
    setApiMessage("");
    setApiLoading(false);
    setShowAllFactors(false);
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <LinearGradient colors={theme.gradients.page} style={styles.gradientBackdrop} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.caption}>Loan</Text>
        <Text style={styles.title}>Loan Eligibility Studio</Text>

        <View style={styles.card}>
          <LoanCategorySelector
            options={LOAN_CATEGORIES}
            selectedKey={form.loanCategory}
            onSelect={(value) => setField("loanCategory", value)}
          />

          <Field
            label="CIBIL Score"
            keyboardType="number-pad"
            value={form.cibilScore}
            onChangeText={(value) => setField("cibilScore", value)}
            onBlur={() => onBlur("cibilScore")}
            placeholder="Enter CIBIL between 300 and 900"
            error={touched.cibilScore ? errors.cibilScore : ""}
            theme={theme}
          />

          <Field
            label="Monthly Salary (INR)"
            keyboardType="numeric"
            value={form.monthlySalary}
            onChangeText={(value) => setField("monthlySalary", value)}
            onBlur={() => onBlur("monthlySalary")}
            placeholder="Enter monthly salary"
            error={touched.monthlySalary ? errors.monthlySalary : ""}
            theme={theme}
          />

          <Field
            label="Amount Demand (INR)"
            keyboardType="numeric"
            value={form.amountDemand}
            onChangeText={(value) => setField("amountDemand", value)}
            onBlur={() => onBlur("amountDemand")}
            placeholder="Enter required loan amount"
            error={touched.amountDemand ? errors.amountDemand : ""}
            theme={theme}
          />

          <Field
            label="Tenure (Months)"
            keyboardType="number-pad"
            value={form.tenureMonths}
            onChangeText={(value) => setField("tenureMonths", value)}
            onBlur={() => onBlur("tenureMonths")}
            placeholder="Enter tenure in months"
            error={touched.tenureMonths ? errors.tenureMonths : ""}
            theme={theme}
          />

          <BankSelector
            options={BANK_OPTIONS}
            selectedKey={form.selectedBank}
            onSelect={(value) => setField("selectedBank", value)}
          />
          {touched.selectedBank && errors.selectedBank ? (
            <Text style={styles.errorText}>{errors.selectedBank}</Text>
          ) : null}

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.actionButton, !isValid && styles.actionButtonDisabled]}
              onPress={onCalculate}
              disabled={!isValid || apiLoading}
            >
              <LinearGradient
                colors={theme.gradients.button}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>
                  {apiLoading ? "Calculating and syncing..." : "Calculate Risk and EMI"}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.resetButton} onPress={onReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </Pressable>
          </View>

          {apiMessage ? (
            <Text style={[styles.syncMessage, result?.dataSource === "live" ? styles.syncSuccess : styles.syncFallback]}>
              {apiMessage}
            </Text>
          ) : null}
        </View>

        <PredictionSummaryCard result={result} />
        {sortedFactors.length ? (
          <View style={styles.factorsCard}>
            <Text style={styles.factorsTitle}>Live Risk Factors</Text>
            {visibleFactors.map((item) => {
              const impactColor = getImpactTone(theme, item.impact);
              return (
                <View key={`${item.factor}-${item.value}`} style={styles.factorItem}>
                  <View style={[styles.impactBadge, { borderColor: impactColor, backgroundColor: `${impactColor}22` }]}>
                    <Text style={[styles.impactBadgeText, { color: impactColor }]}>{item.impact}</Text>
                  </View>
                  <View style={styles.factorTextWrap}>
                    <Text style={styles.factorText}>{item.factor}</Text>
                    <Text style={styles.factorValue}>{item.value}</Text>
                  </View>
                </View>
              );
            })}
            {sortedFactors.length > 3 ? (
              <Pressable
                style={styles.factorToggle}
                onPress={() => setShowAllFactors((prev) => !prev)}
              >
                <Text style={styles.factorToggleText}>
                  {showAllFactors ? "Show top 3" : `Show all (${sortedFactors.length})`}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <EmiBreakdownCard result={result} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType,
  error,
  theme,
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text
        style={{
          color: theme.colors.textSecondary,
          marginBottom: 7,
          fontSize: 12,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.inputBorder,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 13,
          color: theme.colors.textPrimary,
          fontSize: 14,
          backgroundColor: theme.colors.inputBg,
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
      />
      {error ? <Text style={{ marginTop: 6, color: theme.colors.danger, fontSize: 12 }}>{error}</Text> : null}
    </View>
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
      paddingBottom: 120,
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
      marginTop: 4,
      marginBottom: 12,
    },
    card: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 14,
    },
    errorText: {
      marginTop: -6,
      marginBottom: 10,
      color: theme.colors.danger,
      fontSize: 12,
    },
    buttonRow: {
      marginTop: 6,
      gap: 10,
    },
    actionButton: {
      borderRadius: 12,
      overflow: "hidden",
    },
    actionButtonDisabled: {
      opacity: 0.55,
    },
    actionButtonGradient: {
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    actionButtonText: {
      color: "#f4fbff",
      fontWeight: "800",
      fontSize: 14,
    },
    resetButton: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 11,
    },
    resetButtonText: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
      fontSize: 13,
    },
    syncMessage: {
      marginTop: 10,
      fontSize: 12,
      fontWeight: "600",
    },
    syncSuccess: {
      color: theme.colors.success,
    },
    syncFallback: {
      color: theme.colors.warning,
    },
    factorsCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 14,
      marginTop: 12,
    },
    factorsTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 10,
    },
    factorItem: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      padding: 10,
      marginBottom: 8,
    },
    impactBadge: {
      alignSelf: "flex-start",
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 6,
    },
    impactBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    factorTextWrap: {
      gap: 4,
    },
    factorText: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    factorValue: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    factorToggle: {
      marginTop: 2,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      paddingVertical: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    factorToggleText: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: "700",
    },
  });
}
