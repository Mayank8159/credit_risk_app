import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InputField from "../components/InputField";
import { useAppTheme } from "../theme/ThemeContext";

const DEFAULT_CREDENTIALS = {
  username: "demo_low",
  password: "demo123",
};

export default function LoginScreen({
  demoUsers,
  loadingUsers,
  authLoading,
  error,
  onLogin,
}) {
  const { theme } = useAppTheme();
  const [username, setUsername] = useState(DEFAULT_CREDENTIALS.username);
  const [password, setPassword] = useState(DEFAULT_CREDENTIALS.password);
  const styles = createStyles(theme);

  function onSelectUser(user) {
    setUsername(user.username);
    setPassword(user.password || "demo123");
  }

  function onSubmit() {
    onLogin({ username: username.trim(), password });
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
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.gridOverlay} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <Text style={styles.logoMark}>CR</Text>
          <Text style={styles.brandText}>Credit Risk Intelligence</Text>
        </View>
        <Text style={styles.eyebrow}>Secure Access</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Choose a demo profile and sign in to explore live credit-risk predictions.
        </Text>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>3</Text>
            <Text style={styles.kpiLabel}>Demo Personas</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>Live</Text>
            <Text style={styles.kpiLabel}>API Inference</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>v1</Text>
            <Text style={styles.kpiLabel}>Model Stack</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sample Users</Text>
          <Text style={styles.sectionSubtitle}>Tap a profile to auto-fill credentials</Text>
          {loadingUsers ? (
            <ActivityIndicator color="#ff8f7a" style={styles.loader} />
          ) : (
            <View style={styles.userList}>
              {demoUsers.map((user) => {
                const isActive = username === user.username;
                return (
                  <Pressable
                    key={user.username}
                    style={[styles.userChip, isActive && styles.userChipActive]}
                    onPress={() => onSelectUser(user)}
                  >
                    <View style={styles.userChipTopRow}>
                      <Text style={[styles.userChipName, isActive && styles.userChipNameActive]}>
                        {user.full_name}
                      </Text>
                      <Text style={styles.userChipRole}>{user.role}</Text>
                    </View>
                    <Text style={styles.userChipMeta}>@{user.username}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.formBlock}>
            <InputField label="Username" value={username} onChangeText={setUsername} />
            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Pressable
              style={[styles.loginButton, authLoading && styles.loginButtonDisabled]}
              disabled={authLoading}
              onPress={onSubmit}
            >
              <LinearGradient
                colors={theme.gradients.button}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {authLoading ? "Signing in..." : "Login"}
                </Text>
              </LinearGradient>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
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
    glowOne: {
      position: "absolute",
      width: 340,
      height: 340,
      borderRadius: 170,
      top: -80,
      left: -120,
      backgroundColor: theme.mode === "dark" ? "rgba(82, 171, 255, 0.18)" : "rgba(77, 132, 206, 0.16)",
    },
    glowTwo: {
      position: "absolute",
      width: 320,
      height: 320,
      borderRadius: 160,
      right: -120,
      bottom: -90,
      backgroundColor: theme.mode === "dark" ? "rgba(145, 94, 255, 0.18)" : "rgba(81, 137, 232, 0.12)",
    },
    gridOverlay: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.18,
      backgroundColor: "transparent",
      borderWidth: 0,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 44,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    logoMark: {
      width: 34,
      height: 34,
      borderRadius: 17,
      textAlign: "center",
      textAlignVertical: "center",
      fontWeight: "800",
      fontSize: 13,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.chipBg,
      marginRight: 10,
    },
    brandText: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
      fontSize: 14,
      letterSpacing: 0.2,
    },
    eyebrow: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginBottom: 6,
      fontWeight: "600",
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 40,
      fontWeight: "800",
      lineHeight: 44,
    },
    subtitle: {
      marginTop: 10,
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    kpiRow: {
      marginTop: 18,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    kpiCard: {
      width: "31%",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      paddingVertical: 10,
      paddingHorizontal: 8,
    },
    kpiValue: {
      color: theme.colors.textPrimary,
      fontWeight: "800",
      fontSize: 16,
    },
    kpiLabel: {
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontSize: 11,
    },
    card: {
      marginTop: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 16,
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
    sectionSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
      marginBottom: 12,
    },
    loader: {
      marginVertical: 16,
    },
    userList: {
      marginBottom: 6,
    },
    userChip: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      padding: 12,
      marginBottom: 10,
    },
    userChipActive: {
      borderColor: theme.colors.accentSecondary,
      backgroundColor: theme.mode === "dark" ? "rgba(32, 57, 90, 0.92)" : "#dbe9ff",
    },
    userChipTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    userChipName: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
      fontSize: 15,
    },
    userChipNameActive: {
      color: theme.colors.chipText,
    },
    userChipRole: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.chipBg,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 8,
    },
    userChipMeta: {
      color: theme.colors.textSecondary,
      marginTop: 8,
      fontSize: 12,
    },
    formBlock: {
      marginTop: 12,
    },
    loginButton: {
      marginTop: 6,
      borderRadius: 12,
      overflow: "hidden",
    },
    loginButtonGradient: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 13,
    },
    loginButtonDisabled: {
      opacity: 0.65,
    },
    loginButtonText: {
      color: "#f4f9ff",
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 0.4,
    },
    error: {
      marginTop: 10,
      color: theme.colors.danger,
      fontWeight: "700",
      fontSize: 13,
    },
  });
}
