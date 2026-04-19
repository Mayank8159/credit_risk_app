import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";

function formatInr(value) {
  return `INR ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function EmiBreakdownCard({ result }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  if (!result) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>EMI Calculation</Text>
      <View style={styles.itemRow}>
        <Text style={styles.label}>Monthly EMI</Text>
        <Text style={styles.value}>{formatInr(result.emi)}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.label}>Total Payable</Text>
        <Text style={styles.value}>{formatInr(result.totalPayable)}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.label}>Total Interest</Text>
        <Text style={styles.value}>{formatInr(result.totalInterest)}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.label}>EMI to Salary</Text>
        <Text style={styles.value}>{result.emiToSalaryRatio}%</Text>
      </View>
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
      marginBottom: 20,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 8,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      paddingHorizontal: 11,
      paddingVertical: 9,
      marginTop: 8,
    },
    label: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    value: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "800",
    },
  });
}
