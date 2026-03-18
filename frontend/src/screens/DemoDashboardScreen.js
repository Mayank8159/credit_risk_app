import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import InputField from "../components/InputField";
import RiskResultCard from "../components/RiskResultCard";
import { USER_SCENARIO_PAYLOADS } from "../constants/riskPayloads";
import { fetchDemoUsers, loginDemoUser } from "../services/authService";
import { analyzeRisk } from "../services/riskService";

export default function DemoDashboardScreen() {
  const [username, setUsername] = useState("demo_low");
  const [password, setPassword] = useState("demo123");
  const [demoUsers, setDemoUsers] = useState([]);
  const [session, setSession] = useState(null);
  const [liveAnalysis, setLiveAnalysis] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      try {
        setLoadingUsers(true);
        const payload = await fetchDemoUsers();
        if (mounted) {
          setDemoUsers(payload.users || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoadingUsers(false);
        }
      }
    }

    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const activePayload = useMemo(() => {
    if (!session?.user?.username) {
      return null;
    }
    return USER_SCENARIO_PAYLOADS[session.user.username] || USER_SCENARIO_PAYLOADS.demo_low;
  }, [session]);

  async function onLoginPress() {
    try {
      setError("");
      setAuthLoading(true);
      setLiveAnalysis(null);
      const response = await loginDemoUser({ username, password });
      setSession(response);
    } catch (err) {
      setError(err.message);
      setSession(null);
    } finally {
      setAuthLoading(false);
    }
  }

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
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Credit Risk Test Console</Text>
        <Text style={styles.subHeading}>
          Login with 1 of the 3 demo users and compare preview vs live backend inference.
        </Text>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Demo Login</Text>
          <InputField label="Username" value={username} onChangeText={setUsername} />
          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable style={styles.primaryButton} onPress={onLoginPress} disabled={authLoading}>
            <Text style={styles.primaryButtonText}>
              {authLoading ? "Signing in..." : "Login"}
            </Text>
          </Pressable>

          {loadingUsers ? (
            <ActivityIndicator color="#9bd2ff" style={styles.loader} />
          ) : (
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>Demo Credentials</Text>
              {demoUsers.map((item) => (
                <Text key={item.username} style={styles.hintText}>
                  {item.username} / {item.password} ({item.role})
                </Text>
              ))}
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        {session ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Logged In User</Text>
            <Text style={styles.userLine}>{session.user.full_name}</Text>
            <Text style={styles.userLine}>{session.user.role}</Text>

            <RiskResultCard title="Preview Output (Mock)" result={session.dashboard_preview} />

            <Pressable
              style={[styles.primaryButton, styles.secondaryButton]}
              onPress={onAnalyzePress}
              disabled={analyzeLoading}
            >
              <Text style={styles.primaryButtonText}>
                {analyzeLoading ? "Analyzing..." : "Run Live Risk Analyze"}
              </Text>
            </Pressable>

            <RiskResultCard title="Live Output (/risk/analyze)" result={liveAnalysis} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#08161f",
  },
  backgroundOrbTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -40,
    right: -30,
    backgroundColor: "rgba(44, 165, 238, 0.22)",
  },
  backgroundOrbBottom: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: -120,
    left: -60,
    backgroundColor: "rgba(42, 219, 167, 0.2)",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    color: "#eff9ff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 12,
  },
  subHeading: {
    color: "#99b8c8",
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20,
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(18, 44, 62, 0.62)",
    padding: 14,
    marginBottom: 14,
  },
  panelTitle: {
    color: "#f2f8fc",
    fontWeight: "700",
    marginBottom: 12,
    fontSize: 16,
  },
  primaryButton: {
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "#2a9fe5",
  },
  secondaryButton: {
    marginTop: 14,
    backgroundColor: "#00b58f",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  loader: {
    marginTop: 14,
  },
  hintBox: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 10,
  },
  hintTitle: {
    color: "#d9edf7",
    fontWeight: "700",
    marginBottom: 6,
  },
  hintText: {
    color: "#bdd3e0",
    fontSize: 13,
    marginBottom: 2,
  },
  error: {
    marginTop: 10,
    color: "#ff8795",
    fontWeight: "600",
  },
  userLine: {
    color: "#d4e5ef",
    marginBottom: 2,
  },
});
