import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../theme/ThemeContext";

const TREND_MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

function buildTrendSeries(score) {
  const offsets = [-9, -5, -2, 1, 4, 7];
  return offsets.map((offset) => clampScore((score || 50) + offset));
}

function mapImpactMix(riskFactors) {
  const mix = { High: 0, Medium: 0, Low: 0 };
  (riskFactors || []).forEach((item) => {
    if (item?.impact === "High") {
      mix.High += 1;
    } else if (item?.impact === "Medium") {
      mix.Medium += 1;
    } else {
      mix.Low += 1;
    }
  });

  const total = Math.max(1, mix.High + mix.Medium + mix.Low);
  return {
    total,
    highPct: Math.round((mix.High / total) * 100),
    mediumPct: Math.round((mix.Medium / total) * 100),
    lowPct: Math.round((mix.Low / total) * 100),
    counts: mix,
  };
}

export default function InsightsScreen({ session }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  const preview = session?.dashboard_preview;
  const riskScore = preview?.risk_score ?? 0;
  const utilization = preview?.utilization_rate ?? 0;
  const totalAssets = preview?.portfolio_risk?.total_assets_inr ?? preview?.portfolio_risk?.total_assets_usd ?? 0;
  const trendSeries = buildTrendSeries(riskScore);
  const trendMax = Math.max(...trendSeries, 1);
  const impactMix = mapImpactMix(preview?.risk_factors);

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <LinearGradient colors={theme.gradients.page} style={styles.gradientBackdrop} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.caption}>Insights</Text>
        <Text style={styles.title}>Portfolio Intelligence</Text>

        <View style={styles.scoreStripCard}>
          <View style={styles.scoreStripLeft}>
            <Text style={styles.cardLabel}>Current Risk Grade</Text>
            <Text style={styles.scoreStripGrade}>{preview?.risk_grade ?? "-"}</Text>
            <Text style={styles.cardNote}>Model confidence uses latest profile factors.</Text>
          </View>
          <View style={styles.scoreChip}>
            <Text style={styles.scoreChipValue}>{riskScore}</Text>
            <Text style={styles.scoreChipLabel}>Score</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Risk Factor Impact Mix</Text>
          <View style={styles.segmentTrack}>
            <View style={[styles.segment, styles.segmentHigh, { width: `${impactMix.highPct}%` }]} />
            <View
              style={[
                styles.segment,
                styles.segmentMedium,
                { width: `${impactMix.mediumPct}%` },
              ]}
            />
            <View style={[styles.segment, styles.segmentLow, { width: `${impactMix.lowPct}%` }]} />
          </View>
          <View style={styles.legendRow}>
            <Text style={styles.legendItem}>High {impactMix.counts.High}</Text>
            <Text style={styles.legendItem}>Medium {impactMix.counts.Medium}</Text>
            <Text style={styles.legendItem}>Low {impactMix.counts.Low}</Text>
          </View>
          <Text style={styles.cardNote}>Composition of active risk factors from latest inference.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Utilization Gauge</Text>
          <View style={styles.gaugeTrack}>
            <LinearGradient
              colors={[theme.colors.success, theme.colors.warning, theme.colors.danger]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.gaugeFill, { width: `${Math.min(100, utilization)}%` }]}
            />
          </View>
          <View style={styles.gaugeLabels}>
            <Text style={styles.gaugeLabel}>0%</Text>
            <Text style={styles.gaugeValue}>{utilization}%</Text>
            <Text style={styles.gaugeLabel}>100%</Text>
          </View>
          <Text style={styles.cardNote}>
            Portfolio ₹{Number(totalAssets).toLocaleString("en-IN")} | NPC {preview?.portfolio_risk?.npc_rate_percent ?? "-"}%
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Projected Risk Momentum (6M)</Text>
          <View style={styles.trendBarsRow}>
            {trendSeries.map((point, index) => {
              const barHeight = Math.max(16, (point / trendMax) * 120);
              const barColor =
                point >= 70
                  ? theme.colors.danger
                  : point >= 35
                    ? theme.colors.warning
                    : theme.colors.success;

              return (
                <View key={TREND_MONTHS[index]} style={styles.trendItem}>
                  <View style={styles.trendBarTrack}>
                    <View style={[styles.trendBar, { height: barHeight, backgroundColor: barColor }]} />
                  </View>
                  <Text style={styles.trendMonth}>{TREND_MONTHS[index]}</Text>
                  <Text style={styles.trendValue}>{point}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.cardNote}>Momentum curve is normalized from current risk score baseline.</Text>
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
      paddingBottom: 120,
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
      marginTop: 4,
      marginBottom: 4,
    },
    scoreStripCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    scoreStripLeft: {
      flex: 1,
      paddingRight: 12,
    },
    scoreStripGrade: {
      marginTop: 6,
      color: theme.colors.textPrimary,
      fontSize: 28,
      fontWeight: "800",
    },
    scoreChip: {
      width: 84,
      height: 84,
      borderRadius: 42,
      borderWidth: 2,
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.cardMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    scoreChipValue: {
      color: theme.colors.textPrimary,
      fontSize: 28,
      fontWeight: "800",
      lineHeight: 30,
    },
    scoreChipLabel: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    card: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 16,
    },
    cardLabel: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    cardValue: {
      marginTop: 6,
      color: theme.colors.textPrimary,
      fontSize: 28,
      fontWeight: "800",
    },
    segmentTrack: {
      marginTop: 10,
      height: 12,
      borderRadius: 999,
      overflow: "hidden",
      flexDirection: "row",
      backgroundColor: theme.colors.cardMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    segment: {
      height: "100%",
    },
    segmentHigh: {
      backgroundColor: theme.colors.danger,
    },
    segmentMedium: {
      backgroundColor: theme.colors.warning,
    },
    segmentLow: {
      backgroundColor: theme.colors.success,
    },
    legendRow: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    legendItem: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
    },
    gaugeTrack: {
      marginTop: 10,
      height: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
      backgroundColor: theme.colors.cardMuted,
    },
    gaugeFill: {
      height: "100%",
      borderRadius: 999,
    },
    gaugeLabels: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    gaugeLabel: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    gaugeValue: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: "800",
    },
    trendBarsRow: {
      marginTop: 12,
      height: 166,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    trendItem: {
      width: "15%",
      alignItems: "center",
    },
    trendBarTrack: {
      width: "90%",
      height: 122,
      justifyContent: "flex-end",
      borderRadius: 10,
      backgroundColor: theme.colors.cardMuted,
      paddingBottom: 2,
      paddingHorizontal: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    trendBar: {
      width: "100%",
      borderRadius: 8,
    },
    trendMonth: {
      marginTop: 6,
      color: theme.colors.textSecondary,
      fontSize: 11,
      textTransform: "uppercase",
      fontWeight: "700",
    },
    trendValue: {
      color: theme.colors.textPrimary,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 2,
    },
    cardNote: {
      marginTop: 6,
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
  });
}
