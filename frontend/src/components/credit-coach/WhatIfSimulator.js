/**
 * What-If Simulator Component
 * Interactive tool to explore hypothetical credit improvements
 * Users can adjust key factors and see projected impact
 */

import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAppTheme } from "../../theme/ThemeContext";
import { simulateWhatIf } from "../../services/creditCoachService";
import RecommendationCard from "./RecommendationCard";

/**
 * Custom horizontal slider component using buttons instead of native Slider
 */
function SimpleSlider({ value, onValueChange, min, max, step, theme }) {
  const handleChange = (newValue) => {
    const rounded = Math.round(newValue / step) * step;
    onValueChange(Math.max(min, Math.min(max, rounded)));
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const styles = useRef(createSliderStyles(theme));

  return (
    <View style={styles.current.container}>
      <View style={styles.current.track}>
        <View
          style={[
            styles.current.fill,
            {
              width: `${percentage}%`,
              backgroundColor: theme.colors.accent,
            },
          ]}
        />
      </View>
      <View style={[styles.current.thumb, { left: `${percentage}%` }]} />
      <View style={styles.current.buttonsContainer}>
        <Pressable
          onPress={() => handleChange(value - step * 2)}
          style={styles.current.button}
        >
          <Text style={styles.current.buttonText}>−</Text>
        </Pressable>
        <Pressable
          onPress={() => handleChange(value + step * 2)}
          style={styles.current.button}
        >
          <Text style={styles.current.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createSliderStyles(theme) {
  return StyleSheet.create({
    container: {
      marginTop: 12,
      marginBottom: 8,
    },
    track: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      borderRadius: 2,
    },
    thumb: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.accent,
      marginTop: -8,
      marginLeft: -9,
      borderWidth: 3,
      borderColor: theme.colors.card,
      elevation: 2,
      shadowColor: theme.colors.accent,
      shadowOpacity: 0.5,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 8,
    },
    button: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.accent,
    },
  });
}

export default function WhatIfSimulator({ riskResult }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  // Hypothetical values
  const [debtRatio, setDebtRatio] = useState(riskResult?.loan_percent_income || 0.3);
  const [empLength, setEmpLength] = useState(riskResult?.person_emp_length || 5);
  const [loanGrade, setLoanGrade] = useState(riskResult?.loan_grade || "C");
  const [interestRate, setInterestRate] = useState(riskResult?.loan_int_rate || 10);

  // Original values (for display)
  const originalDebtRatio = riskResult?.loan_percent_income || 0.3;
  const originalEmpLength = riskResult?.person_emp_length || 5;
  const originalLoanGrade = riskResult?.loan_grade || "C";
  const originalInterestRate = riskResult?.loan_int_rate || 10;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  async function handleSimulate() {
    if (!riskResult) {
      setError("No analysis available. Please run risk analysis first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        risk_score: riskResult.risk_score,
        risk_grade: riskResult.risk_grade,
        loan_percent_income: originalDebtRatio,
        person_emp_length: originalEmpLength,
        loan_grade: originalLoanGrade,
        cb_person_default_on_file: riskResult.cb_person_default_on_file || "N",
        loan_int_rate: originalInterestRate,
        person_age: riskResult.person_age || 35,
        person_income: riskResult.person_income || 500000,
        // Hypothetical modifications
        hypothetical_loan_percent_income: debtRatio !== originalDebtRatio ? debtRatio : null,
        hypothetical_person_emp_length: empLength !== originalEmpLength ? empLength : null,
        hypothetical_loan_grade: loanGrade !== originalLoanGrade ? loanGrade : null,
        hypothetical_loan_int_rate: interestRate !== originalInterestRate ? interestRate : null,
      };

      const response = await simulateWhatIf(payload);
      setResult(response);
    } catch (err) {
      const debugMessage = err?.message || "Simulation request failed";
      console.error("What-if simulation failed:", debugMessage);
      if (debugMessage.toLowerCase().includes("not found") || debugMessage.includes("404")) {
        setError("Simulation service endpoint is unavailable. Please verify backend deployment URL and try again.");
      } else {
        setError(`Unable to run simulation right now. ${debugMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setDebtRatio(originalDebtRatio);
    setEmpLength(originalEmpLength);
    setLoanGrade(originalLoanGrade);
    setInterestRate(originalInterestRate);
    setResult(null);
    setError("");
  }

  const hasChanges =
    debtRatio !== originalDebtRatio ||
    empLength !== originalEmpLength ||
    loanGrade !== originalLoanGrade ||
    interestRate !== originalInterestRate;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Debt Ratio Slider */}
        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.labelMain}>Debt-to-Income Ratio</Text>
            <View style={styles.valueRow}>
              <Text style={styles.originalValue}>{(originalDebtRatio * 100).toFixed(0)}%</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={[styles.hypotheticalValue, getColorForValue("debt", debtRatio)]}>
                {(debtRatio * 100).toFixed(0)}%
              </Text>
            </View>
          </View>
          <SimpleSlider
            value={debtRatio}
            onValueChange={setDebtRatio}
            min={0}
            max={0.6}
            step={0.02}
            theme={theme}
          />
          <Text style={styles.hint}>Lower is better. Aim below 30%.</Text>
        </View>

        {/* Employment Length Control */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.labelMain}>Employment History</Text>
            <View style={styles.valueRow}>
              <Text style={styles.originalValue}>{originalEmpLength.toFixed(1)} yrs</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={[styles.hypotheticalValue, getColorForValue("emp", empLength)]}>
                {empLength.toFixed(1)} yrs
              </Text>
            </View>
          </View>
          <SimpleSlider
            value={empLength}
            onValueChange={setEmpLength}
            min={0}
            max={25}
            step={0.5}
            theme={theme}
          />
          <Text style={styles.hint}>More experience = more stability</Text>
        </View>

        {/* Loan Grade Selector */}
        <View style={styles.section}>
          <Text style={styles.labelMain}>Loan Grade</Text>
          <View style={styles.valueRow}>
            <Text style={styles.originalValue}>{originalLoanGrade}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={[styles.hypotheticalValue, getColorForValue("grade", loanGrade)]}>
              {loanGrade}
            </Text>
          </View>
          <View style={styles.gradeGrid}>
            {["A", "B", "C", "D", "E", "F", "G"].map((grade) => (
              <Pressable
                key={grade}
                onPress={() => setLoanGrade(grade)}
                style={[
                  styles.gradeButton,
                  loanGrade === grade && styles.gradeButtonActive,
                  loanGrade === grade && {
                    backgroundColor: getGradeColor(theme, grade),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.gradeText,
                    loanGrade === grade && styles.gradeTextActive,
                  ]}
                >
                  {grade}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.hint}>A = Best, G = Worst. Better grades reduce risk.</Text>
        </View>

        {/* Interest Rate Slider */}
        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.labelMain}>Interest Rate (%)</Text>
            <View style={styles.valueRow}>
              <Text style={styles.originalValue}>{originalInterestRate.toFixed(1)}</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={[styles.hypotheticalValue, getColorForValue("rate", interestRate)]}>
                {interestRate.toFixed(1)}
              </Text>
            </View>
          </View>
          <SimpleSlider
            value={interestRate}
            onValueChange={setInterestRate}
            min={2}
            max={30}
            step={0.5}
            theme={theme}
          />
          <Text style={styles.hint}>Lower rates = better terms</Text>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Result Display */}
        {result && (
          <View style={styles.resultSection}>
            <LinearGradient
              colors={[
                getImpactColor(theme, result.impact_level).bg1,
                getImpactColor(theme, result.impact_level).bg2,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resultCard}
            >
              <Text style={styles.resultTitle}>Projected Impact</Text>

              <View style={styles.scoreComparison}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>Current</Text>
                  <Text style={styles.scoreValue}>{result.original_risk_score}</Text>
                  <Text style={styles.scoreGrade}>{result.original_risk_grade}</Text>
                </View>
                <Text style={styles.scoreArrow}>→</Text>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>Projected</Text>
                  <Text style={styles.scoreValue}>{result.estimated_risk_score}</Text>
                  <Text
                    style={[
                      styles.scoreGrade,
                      {
                        color:
                          result.score_change <= -10
                            ? theme.colors.success
                            : result.score_change >= 5
                              ? theme.colors.danger
                              : theme.colors.warning,
                      },
                    ]}
                  >
                    {result.estimated_risk_grade}
                  </Text>
                </View>
              </View>

              <View style={styles.impactBadge}>
                <Text style={styles.impactText}>
                  {result.score_change < 0 ? "↓" : result.score_change > 0 ? "↑" : "→"}{" "}
                  {Math.abs(result.score_change)} points
                </Text>
              </View>

              <Text style={styles.impactSummary}>{result.impact_summary}</Text>

              {result.changed_factors && result.changed_factors.length > 0 && (
                <View style={styles.changedFactorsSection}>
                  <Text style={styles.changedFactorsTitle}>Changed Factors:</Text>
                  {result.changed_factors.map((factor, idx) => (
                    <Text key={idx} style={styles.changedFactorItem}>
                      • {factor.factor_name}: {factor.impact_description}
                    </Text>
                  ))}
                </View>
              )}
            </LinearGradient>

            {result.recommendations && result.recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>To Achieve This Scenario:</Text>
                {result.recommendations.map((rec, idx) => (
                  <RecommendationCard
                    key={idx}
                    icon="✓"
                    title={rec.split(":")[0]}
                    description={rec.split(":")[1]}
                    accent="success"
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={styles.loadingText}>Simulating scenario...</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.buttonReset,
            pressed && styles.buttonPressed,
            !hasChanges && styles.buttonDisabled,
          ]}
          disabled={!hasChanges}
        >
          <Text style={styles.buttonResetText}>Reset</Text>
        </Pressable>
        <Pressable
          onPress={handleSimulate}
          style={({ pressed }) => [
            styles.buttonSimulate,
            pressed && styles.buttonPressed,
            !hasChanges && styles.buttonDisabled,
          ]}
          disabled={!hasChanges || loading}
        >
          <Text style={styles.buttonSimulateText}>
            {loading ? "Simulating..." : "Simulate Impact"}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function getColorForValue(type, value) {
  if (type === "debt") {
    if (value < 0.2) return { color: "#79dfb4" };
    if (value < 0.35) return { color: "#f2c56e" };
    return { color: "#f27f70" };
  } else if (type === "emp") {
    if (value >= 10) return { color: "#79dfb4" };
    if (value >= 2) return { color: "#f2c56e" };
    return { color: "#f27f70" };
  } else if (type === "grade") {
    if (value <= "C") return { color: "#79dfb4" };
    if (value <= "E") return { color: "#f2c56e" };
    return { color: "#f27f70" };
  } else if (type === "rate") {
    if (value <= 8) return { color: "#79dfb4" };
    if (value <= 14) return { color: "#f2c56e" };
    return { color: "#f27f70" };
  }
  return { color: "#526577" };
}

function getGradeColor(theme, grade) {
  const gradeMap = {
    A: `${theme.colors.success}30`,
    B: `${theme.colors.success}25`,
    C: `${theme.colors.warning}25`,
    D: `${theme.colors.warning}30`,
    E: `${theme.colors.danger}25`,
    F: `${theme.colors.danger}30`,
    G: `${theme.colors.danger}35`,
  };
  return gradeMap[grade] || theme.colors.chipBg;
}

function getImpactColor(theme, level) {
  const impacts = {
    high_positive: {
      bg1: `${theme.colors.success}20`,
      bg2: `${theme.colors.success}10`,
      text: theme.colors.success,
    },
    moderate_positive: {
      bg1: `${theme.colors.success}15`,
      bg2: `${theme.colors.warning}10`,
      text: theme.colors.success,
    },
    slight_positive: {
      bg1: `${theme.colors.warning}15`,
      bg2: `${theme.colors.warning}05`,
      text: theme.colors.warning,
    },
    no_change: {
      bg1: theme.colors.cardMuted,
      bg2: theme.colors.card,
      text: theme.colors.textSecondary,
    },
    negative: {
      bg1: `${theme.colors.danger}15`,
      bg2: `${theme.colors.danger}05`,
      text: theme.colors.danger,
    },
  };
  return impacts[level] || impacts.no_change;
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      overflow: "hidden",
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 16,
      paddingBottom: 100,
    },

    section: {
      marginBottom: 24,
      paddingHorizontal: 14,
      paddingVertical: 14,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },

    labelMain: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      flex: 1,
    },

    valueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    originalValue: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },

    arrow: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: "bold",
    },

    hypotheticalValue: {
      fontSize: 12,
      fontWeight: "600",
    },

    hint: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontStyle: "italic",
      marginTop: 10,
    },

    gradeGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 6,
      marginTop: 12,
      marginBottom: 12,
    },

    gradeButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.inputBg,
      alignItems: "center",
    },

    gradeButtonActive: {
      borderWidth: 2,
      borderColor: theme.colors.accent,
    },

    gradeText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },

    gradeTextActive: {
      color: "#ffffff",
    },

    errorBanner: {
      backgroundColor: `${theme.colors.danger}20`,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.danger,
    },

    errorText: {
      fontSize: 12,
      color: theme.colors.danger,
    },

    resultSection: {
      marginBottom: 16,
    },

    resultCard: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 14,
    },

    resultTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: 14,
    },

    scoreComparison: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      paddingHorizontal: 12,
    },

    scoreBox: {
      alignItems: "center",
    },

    scoreLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },

    scoreValue: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.accent,
      marginTop: 2,
    },

    scoreGrade: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      marginTop: 2,
    },

    scoreArrow: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.textSecondary,
      marginHorizontal: 8,
    },

    impactBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: `${theme.colors.accentSecondary}30`,
      alignSelf: "center",
      marginBottom: 10,
    },

    impactText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.accent,
    },

    impactSummary: {
      fontSize: 13,
      color: theme.colors.textPrimary,
      lineHeight: 18,
      marginBottom: 12,
      textAlign: "center",
    },

    changedFactorsSection: {
      marginTop: 12,
      paddingHorizontal: 10,
      paddingVertical: 10,
      backgroundColor: `${theme.colors.accent}10`,
      borderRadius: 8,
    },

    changedFactorsTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      marginBottom: 6,
    },

    changedFactorItem: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      lineHeight: 15,
      marginBottom: 4,
    },

    recommendationsContainer: {
      marginTop: 14,
    },

    recommendationsTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      marginBottom: 10,
    },

    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 40,
    },

    loadingText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 10,
    },

    actionBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      padding: 12,
      gap: 10,
      backgroundColor: theme.colors.card,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    buttonReset: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: "transparent",
      alignItems: "center",
    },

    buttonSimulate: {
      flex: 1.2,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.accent,
      alignItems: "center",
    },

    buttonPressed: {
      opacity: 0.6,
    },

    buttonDisabled: {
      opacity: 0.4,
    },

    buttonResetText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.accent,
    },

    buttonSimulateText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#ffffff",
    },
  });
}
