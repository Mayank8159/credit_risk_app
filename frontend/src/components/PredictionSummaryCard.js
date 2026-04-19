import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";

function toneByRisk(theme, band) {
  if (band === "High") {
    return theme.colors.danger;
  }
  if (band === "Moderate") {
    return theme.colors.warning;
  }
  return theme.colors.success;
}

export default function PredictionSummaryCard({ result }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  if (!result) {
    return null;
  }

  const riskTone = toneByRisk(theme, result.riskBand);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Risk and Credit Summary</Text>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Risk Score</Text>
          <Text style={[styles.metricValue, { color: riskTone }]}>{result.riskScore}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Risk Band</Text>
          <Text style={[styles.metricValue, { color: riskTone }]}>{result.riskBand}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Credit Band</Text>
          <Text style={styles.metricValue}>{result.creditBand}</Text>
        </View>
      </View>
      <Text style={styles.note}>
        Salary Affordability: {result.affordabilityBand} ({result.emiToSalaryRatio}% of monthly salary)
      </Text>
      <Text style={styles.note}>
        Source: {result.dataSource === "live" ? "Live Backend" : "Local Fallback"}
      </Text>
      {typeof result.utilizationRate === "number" ? (
        <Text style={styles.note}>Backend Utilization: {result.utilizationRate}%</Text>
      ) : null}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    card: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 14,
      marginTop: 12,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 10,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    metric: {
      width: "31%",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      padding: 10,
    },
    metricLabel: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    metricValue: {
      color: theme.colors.textPrimary,
      marginTop: 5,
      fontSize: 16,
      fontWeight: "800",
    },
    note: {
      marginTop: 10,
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
  });
}
