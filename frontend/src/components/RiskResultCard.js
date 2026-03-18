import { StyleSheet, Text, View } from "react-native";

function RiskBadge({ grade }) {
  const color =
    grade === "High" ? "#f07a6d" : grade === "Moderate" ? "#f2c56e" : "#72d8af";

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{grade}</Text>
    </View>
  );
}

export default function RiskResultCard({ title, result }) {
  if (!result) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <RiskBadge grade={result.risk_grade} />
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
      </View>

      <Text style={styles.sectionTitle}>Risk Factors</Text>
      {result.risk_factors.map((factor) => (
        <View key={`${factor.factor}-${factor.value}`} style={styles.factorRow}>
          <Text style={styles.factorDot}>•</Text>
          <Text style={styles.factorText}>
            {factor.factor} ({factor.impact}) - {factor.value}
          </Text>
        </View>
      ))}

      <Text style={styles.portfolioText}>
        Portfolio: ${result.portfolio_risk.total_assets_usd.toLocaleString()} | NPC {result.portfolio_risk.npc_rate_percent}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(140, 168, 193, 0.28)",
    backgroundColor: "rgba(32, 53, 74, 0.84)",
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    color: "#ecf3fa",
    fontWeight: "700",
    fontSize: 16,
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
    gap: 16,
    marginBottom: 10,
  },
  metricBlock: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(23, 41, 59, 0.75)",
  },
  metricLabel: {
    color: "#9ab1c4",
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: "#f39b88",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#d8e5f0",
    fontWeight: "600",
    marginBottom: 6,
  },
  factorRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  factorDot: {
    color: "#f39b88",
    marginRight: 6,
    fontWeight: "700",
  },
  factorText: {
    color: "#c8d8e6",
    flex: 1,
  },
  portfolioText: {
    marginTop: 10,
    color: "#95adbf",
    fontSize: 12,
  },
});
