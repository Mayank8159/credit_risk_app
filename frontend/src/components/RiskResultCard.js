import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";

function RiskBadge({ grade, styles, theme }) {
  const color =
    grade === "High"
      ? theme.colors.danger
      : grade === "Moderate"
        ? theme.colors.warning
        : theme.colors.success;

  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}22` }]}>
      <Text style={[styles.badgeText, { color }]}>{grade}</Text>
    </View>
  );
}

export default function RiskResultCard({ title, result }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  if (!result) {
    return null;
  }

  return (
    <LinearGradient
      colors={[theme.colors.card, theme.colors.cardMuted]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Inference confidence panel</Text>
        </View>
        <RiskBadge grade={result.risk_grade} styles={styles} theme={theme} />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBlock}>
          <Text style={styles.metricLabel}>Risk Score</Text>
          <Text style={styles.metricValue}>{result.risk_score}</Text>
        </View>
        <View style={styles.metricBlock}>
          <Text style={styles.metricLabel}>Utilization</Text>
          <Text style={styles.metricValue}>{result.utilization_rate}%</Text>
        </View>
        <View style={styles.metricBlock}>
          <Text style={styles.metricLabel}>Factors</Text>
          <Text style={styles.metricValue}>{result.risk_factors.length}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Risk Factors</Text>
      {result.risk_factors.map((factor) => (
        <View key={`${factor.factor}-${factor.value}`} style={styles.factorChip}>
          <Text style={styles.factorImpact}>{factor.impact}</Text>
          <Text style={styles.factorText}>{factor.factor}</Text>
          <Text style={styles.factorValue}>{factor.value}</Text>
        </View>
      ))}

      <Text style={styles.portfolioText}>
        Portfolio Exposure ₹{result.portfolio_risk.total_assets_inr.toLocaleString('en-IN')} | NPC {result.portfolio_risk.npc_rate_percent}%
      </Text>
    </LinearGradient>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    card: {
      marginTop: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    title: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
      fontSize: 16,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontSize: 12,
    },
    badge: {
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    metricsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    metricBlock: {
      width: "31%",
      padding: 10,
      borderRadius: 12,
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    metricLabel: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    metricValue: {
      color: theme.colors.textPrimary,
      fontSize: 19,
      fontWeight: "700",
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontWeight: "600",
      marginBottom: 6,
    },
    factorChip: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      padding: 10,
      marginBottom: 8,
    },
    factorImpact: {
      alignSelf: "flex-start",
      color: theme.colors.accentSecondary,
      backgroundColor: `${theme.colors.accentSecondary}22`,
      borderRadius: 999,
      overflow: "hidden",
      paddingVertical: 2,
      paddingHorizontal: 8,
      fontWeight: "700",
      fontSize: 11,
      marginBottom: 6,
    },
    factorText: {
      color: theme.colors.textPrimary,
      fontWeight: "600",
      marginBottom: 4,
    },
    factorValue: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    portfolioText: {
      marginTop: 10,
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
  });
}
