import { useEffect, useMemo, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RiskResultCard from "../components/RiskResultCard";
import { USER_SCENARIO_PAYLOADS } from "../constants/riskPayloads";
import { analyzeRisk } from "../services/riskService";
import { useAppTheme } from "../theme/ThemeContext";

function getScoreTone(score) {
  if (score >= 70) {
    return "#f27f70";
  }
  if (score >= 35) {
    return "#f2c56e";
  }
  return "#79dfb4";
}

function getRiskSummary(score) {
  if (score >= 70) {
    return "Elevated risk profile";
  }
  if (score >= 35) {
    return "Balanced but watchlist";
  }
  return "Healthy risk profile";
}

export default function DemoDashboardScreen({
  session,
  demoUsers,
  switchLoading,
  onQuickSwitch,
}) {
  const { theme } = useAppTheme();
  const [liveAnalysis, setLiveAnalysis] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [error, setError] = useState("");

  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.94)).current;
  const panelOpacity = useRef(new Animated.Value(0)).current;
  const panelTranslateY = useRef(new Animated.Value(16)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultTranslateY = useRef(new Animated.Value(20)).current;
  const styles = createStyles(theme);

  const activePayload = useMemo(() => {
    if (!session?.user?.username) {
      return null;
    }
    return USER_SCENARIO_PAYLOADS[session.user.username] || USER_SCENARIO_PAYLOADS.aarav;
  }, [session]);

  const visibleResult = liveAnalysis || session.dashboard_preview;
  const scoreTone = getScoreTone(visibleResult?.risk_score || 0);
  const riskSummary = getRiskSummary(visibleResult?.risk_score || 0);

  useEffect(() => {
    ringOpacity.setValue(0);
    ringScale.setValue(0.94);
    panelOpacity.setValue(0);
    panelTranslateY.setValue(16);
    resultOpacity.setValue(0);
    resultTranslateY.setValue(20);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.spring(ringScale, {
          toValue: 1,
          speed: 11,
          bounciness: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(120, [
        Animated.parallel([
          Animated.timing(panelOpacity, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(panelTranslateY, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(resultOpacity, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(resultTranslateY, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [
    panelOpacity,
    panelTranslateY,
    resultOpacity,
    resultTranslateY,
    ringOpacity,
    ringScale,
    session.user.username,
  ]);

  useEffect(() => {
    setLiveAnalysis(null);
    setError("");
  }, [session.user.username]);

  async function onAnalyzePress() {
    if (!activePayload) {
      return;
    }

    try {
      setError("");
      setAnalyzeLoading(true);
      const result = await analyzeRisk(activePayload);
      setLiveAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzeLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle={theme.mode === "dark" ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={theme.gradients.page}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackdrop}
      />
      <View style={styles.backgroundAuraLarge} />
      <View style={styles.backgroundAuraSmall} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.topCaption}>Credit Report</Text>
            <Text style={styles.heading}>Your credit score</Text>
          </View>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE MODEL</Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.scoreRingOuter,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        >
          <LinearGradient
            colors={theme.gradients.scoreRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreRingInner}
          >
            <Text style={[styles.scoreValue, { color: scoreTone }]}>
              {visibleResult?.risk_score ?? "--"}
            </Text>
            <Text style={styles.scoreLabel}>Risk Score</Text>
            <Text style={styles.scoreSummary}>{riskSummary}</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.userName}>{session.user.full_name}</Text>
        <Text style={styles.userRole}>{session.user.role}</Text>

        <View style={styles.kpiRow}>
          <View style={styles.kpiTile}>
            <Text style={styles.kpiTileLabel}>Grade</Text>
            <Text style={styles.kpiTileValue}>{visibleResult?.risk_grade ?? "-"}</Text>
          </View>
          <View style={styles.kpiTile}>
            <Text style={styles.kpiTileLabel}>Utilization</Text>
            <Text style={styles.kpiTileValue}>{visibleResult?.utilization_rate ?? "-"}%</Text>
          </View>
          <View style={styles.kpiTile}>
            <Text style={styles.kpiTileLabel}>Model</Text>
            <Text style={styles.kpiTileValue}>LR v1</Text>
          </View>
        </View>

        <View style={styles.switchRow}>
          {demoUsers.map((user) => {
            const isActive = user.username === session.user.username;
            return (
              <Pressable
                key={user.username}
                style={[styles.switchChip, isActive && styles.switchChipActive]}
                onPress={() => onQuickSwitch(user.username)}
                disabled={switchLoading || isActive}
              >
                <Text style={[styles.switchChipText, isActive && styles.switchChipTextActive]}>
                  {user.username}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Animated.View
          style={[
            styles.panel,
            { opacity: panelOpacity, transform: [{ translateY: panelTranslateY }] },
          ]}
        >
          <Text style={styles.panelTitle}>Live Backend Analysis</Text>
          <Text style={styles.panelSubtitle}>
            Trigger fresh inference from /risk/analyze using the selected profile.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={onAnalyzePress}
            disabled={analyzeLoading}
          >
            <LinearGradient
              colors={theme.gradients.button}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>
                {analyzeLoading ? "Analyzing..." : "Run Live Risk Analyze"}
              </Text>
            </LinearGradient>
          </Pressable>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </Animated.View>

        <Animated.View
          style={{ opacity: resultOpacity, transform: [{ translateY: resultTranslateY }] }}
        >
          <RiskResultCard
            title={liveAnalysis ? "Live Output" : "Preview Output"}
            result={visibleResult}
          />
        </Animated.View>
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
  backgroundAuraLarge: {
    position: "absolute",
    width: 480,
    height: 480,
    borderRadius: 240,
    top: -180,
    left: -180,
    backgroundColor: theme.mode === "dark" ? "rgba(64, 136, 220, 0.22)" : "rgba(30, 111, 217, 0.08)",
  },
  backgroundAuraSmall: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -100,
    right: -90,
    backgroundColor: theme.mode === "dark" ? "rgba(114, 81, 229, 0.2)" : "rgba(11, 165, 217, 0.06)",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  topCaption: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40,
    maxWidth: 220,
  },
  liveBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardMuted,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  liveBadgeText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  scoreRingOuter: {
    marginTop: 16,
    alignSelf: "center",
    width: 264,
    height: 264,
    borderRadius: 132,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.cardMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scoreRingInner: {
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  scoreLabel: {
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontSize: 13,
  },
  scoreSummary: {
    marginTop: 8,
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  userName: {
    marginTop: 16,
    textAlign: "center",
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
  },
  userRole: {
    textAlign: "center",
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
  },
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  kpiTile: {
    width: "31%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  kpiTileLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  kpiTileValue: {
    color: theme.colors.textPrimary,
    marginTop: 5,
    fontSize: 16,
    fontWeight: "800",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  switchChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardMuted,
    paddingVertical: 9,
    alignItems: "center",
  },
  switchChipActive: {
    borderColor: theme.colors.accentSecondary,
    backgroundColor: theme.colors.chipBg,
  },
  switchChipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  switchChipTextActive: {
    color: theme.colors.chipText,
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: 14,
    marginBottom: 12,
  },
  panelTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  panelSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 20,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#f1f8ff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  error: {
    marginTop: 10,
    color: theme.colors.danger,
    fontWeight: "700",
  },
  });
}
