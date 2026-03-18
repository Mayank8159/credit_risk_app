import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../theme/ThemeContext";

export default function InsightsScreen({ session }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  const preview = session?.dashboard_preview;

  return (
    <View style={styles.root}>
      <LinearGradient colors={theme.gradients.page} style={styles.gradientBackdrop} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.caption}>Insights</Text>
        <Text style={styles.title}>Portfolio Intelligence</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Current Risk Grade</Text>
          <Text style={styles.cardValue}>{preview?.risk_grade ?? "-"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Risk Score</Text>
          <Text style={styles.cardValue}>{preview?.risk_score ?? "-"}</Text>
          <Text style={styles.cardNote}>Live values update when you run backend analysis on Home.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Portfolio Exposure</Text>
          <Text style={styles.cardValue}>
            ${preview?.portfolio_risk?.total_assets_usd?.toLocaleString?.() ?? "0"}
          </Text>
          <Text style={styles.cardNote}>
            NPC {preview?.portfolio_risk?.npc_rate_percent ?? "-"}%
          </Text>
        </View>
      </ScrollView>
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
      paddingTop: 16,
      paddingBottom: 24,
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
    cardNote: {
      marginTop: 6,
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
  });
}
