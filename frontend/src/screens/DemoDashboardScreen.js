import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import RiskResultCard from "../components/RiskResultCard";
import { USER_SCENARIO_PAYLOADS } from "../constants/riskPayloads";
import { analyzeRisk } from "../services/riskService";

function getScoreTone(score) {
  if (score >= 70) {
    return "#f27f70";
  }
  if (score >= 35) {
    return "#f2c56e";
  }
  return "#79dfb4";
}

export default function DemoDashboardScreen({
  session,
  demoUsers,
  switchLoading,
  onQuickSwitch,
  onLogout,
}) {
  const [liveAnalysis, setLiveAnalysis] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [error, setError] = useState("");

  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.94)).current;
  const panelOpacity = useRef(new Animated.Value(0)).current;
  const panelTranslateY = useRef(new Animated.Value(16)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultTranslateY = useRef(new Animated.Value(20)).current;
  const navOpacity = useRef(new Animated.Value(0)).current;
  const navTranslateY = useRef(new Animated.Value(24)).current;

  const activePayload = useMemo(() => {
    if (!session?.user?.username) {
      return null;
    }
    return USER_SCENARIO_PAYLOADS[session.user.username] || USER_SCENARIO_PAYLOADS.demo_low;
  }, [session]);

  const visibleResult = liveAnalysis || session.dashboard_preview;
  const scoreTone = getScoreTone(visibleResult?.risk_score || 0);

  useEffect(() => {
    ringOpacity.setValue(0);
    ringScale.setValue(0.94);
    panelOpacity.setValue(0);
    panelTranslateY.setValue(16);
    resultOpacity.setValue(0);
    resultTranslateY.setValue(20);
    navOpacity.setValue(0);
    navTranslateY.setValue(24);

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
        Animated.parallel([
          Animated.timing(navOpacity, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(navTranslateY, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [
    navOpacity,
    navTranslateY,
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
      <StatusBar barStyle="light-content" />
      <View style={styles.backgroundAuraLarge} />
      <View style={styles.backgroundAuraSmall} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.topCaption}>Credit Report</Text>
            <Text style={styles.heading}>Your credit score</Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
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
          <View style={styles.scoreRingInner}>
            <Text style={[styles.scoreValue, { color: scoreTone }]}>
              {visibleResult?.risk_score ?? "--"}
            </Text>
            <Text style={styles.scoreLabel}>Risk Score</Text>
          </View>
        </Animated.View>

        <Text style={styles.userName}>{session.user.full_name}</Text>
        <Text style={styles.userRole}>{session.user.role}</Text>

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
            Run fresh inference from /risk/analyze using your selected demo persona.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={onAnalyzePress}
            disabled={analyzeLoading}
          >
            <Text style={styles.primaryButtonText}>
              {analyzeLoading ? "Analyzing..." : "Run Live Risk Analyze"}
            </Text>
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

        <Animated.View
          style={[
            styles.bottomNav,
            { opacity: navOpacity, transform: [{ translateY: navTranslateY }] },
          ]}
        >
          <Text style={styles.bottomNavItem}>Save</Text>
          <Text style={[styles.bottomNavItem, styles.bottomNavItemActive]}>Borrow</Text>
          <Text style={styles.bottomNavItem}>Home</Text>
          <Text style={styles.bottomNavItem}>Messages</Text>
          <Text style={styles.bottomNavItem}>Budget</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1f3045",
  },
  backgroundAuraLarge: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -120,
    left: -160,
    backgroundColor: "rgba(62, 97, 136, 0.3)",
  },
  backgroundAuraSmall: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    bottom: -140,
    right: -80,
    backgroundColor: "rgba(39, 72, 102, 0.35)",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 26,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  topCaption: {
    color: "#9fb3c7",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  heading: {
    color: "#f39b88",
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 46,
    maxWidth: 210,
  },
  logoutButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(153, 174, 196, 0.35)",
    backgroundColor: "rgba(32, 52, 74, 0.75)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  logoutButtonText: {
    color: "#d8e6f2",
    fontSize: 12,
    fontWeight: "700",
  },
  scoreRingOuter: {
    marginTop: 18,
    alignSelf: "center",
    width: 250,
    height: 250,
    borderRadius: 125,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(43, 63, 84, 0.72)",
  },
  scoreRingInner: {
    width: 182,
    height: 182,
    borderRadius: 91,
    borderWidth: 3,
    borderColor: "rgba(108, 148, 186, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(29, 47, 67, 0.68)",
  },
  scoreValue: {
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  scoreLabel: {
    color: "#b3c6d8",
    marginTop: 4,
    fontSize: 13,
  },
  userName: {
    marginTop: 18,
    textAlign: "center",
    color: "#eaf3fb",
    fontSize: 30,
    fontWeight: "800",
  },
  userRole: {
    textAlign: "center",
    color: "#adc1d4",
    marginTop: 4,
    marginBottom: 10,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  switchChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(124, 149, 172, 0.4)",
    backgroundColor: "rgba(30, 49, 70, 0.8)",
    paddingVertical: 8,
    alignItems: "center",
  },
  switchChipActive: {
    borderColor: "rgba(243, 155, 136, 0.9)",
    backgroundColor: "rgba(70, 70, 98, 0.86)",
  },
  switchChipText: {
    color: "#b8cadb",
    fontSize: 12,
    fontWeight: "700",
  },
  switchChipTextActive: {
    color: "#ffd4ca",
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(143, 168, 192, 0.28)",
    backgroundColor: "rgba(33, 53, 75, 0.8)",
    padding: 14,
    marginBottom: 14,
  },
  panelTitle: {
    color: "#eef5fb",
    fontSize: 16,
    fontWeight: "700",
  },
  panelSubtitle: {
    color: "#9fb4c8",
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 20,
  },
  primaryButton: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#ef846f",
  },
  primaryButtonText: {
    color: "#1a2e42",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  error: {
    marginTop: 10,
    color: "#ffb6aa",
    fontWeight: "700",
  },
  bottomNav: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: "rgba(30, 47, 67, 0.82)",
    borderWidth: 1,
    borderColor: "rgba(109, 138, 164, 0.2)",
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomNavItem: {
    color: "#7f93a8",
    fontSize: 11,
    fontWeight: "600",
  },
  bottomNavItemActive: {
    color: "#f39b88",
  },
});
