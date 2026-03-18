import { useState } from "react";
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
  const [username, setUsername] = useState(DEFAULT_CREDENTIALS.username);
  const [password, setPassword] = useState(DEFAULT_CREDENTIALS.password);

  function onSelectUser(user) {
    setUsername(user.username);
    setPassword(user.password || "demo123");
  }

  function onSubmit() {
    onLogin({ username: username.trim(), password });
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Credit Report</Text>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Login with one of your 3 sample users to view risk insights.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sample Users</Text>
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
                    <Text style={[styles.userChipName, isActive && styles.userChipNameActive]}>
                      {user.full_name}
                    </Text>
                    <Text style={styles.userChipMeta}>{user.username}</Text>
                    <Text style={styles.userChipMeta}>{user.role}</Text>
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
              <Text style={styles.loginButtonText}>
                {authLoading ? "Signing in..." : "Login"}
              </Text>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1f3045",
  },
  glowOne: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -110,
    left: -90,
    backgroundColor: "rgba(60, 105, 150, 0.26)",
  },
  glowTwo: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    right: -120,
    bottom: -110,
    backgroundColor: "rgba(255, 141, 117, 0.2)",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 44,
  },
  eyebrow: {
    color: "#90a8bf",
    fontSize: 15,
    letterSpacing: 0.4,
    marginBottom: 8,
    fontWeight: "600",
  },
  title: {
    color: "#f7a08d",
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 46,
  },
  subtitle: {
    marginTop: 12,
    color: "#b9cad8",
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    marginTop: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(145, 170, 197, 0.28)",
    backgroundColor: "rgba(28, 47, 68, 0.88)",
    padding: 16,
  },
  sectionTitle: {
    color: "#eff5fb",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  loader: {
    marginVertical: 16,
  },
  userList: {
    gap: 10,
  },
  userChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(133, 159, 187, 0.34)",
    backgroundColor: "rgba(24, 41, 60, 0.85)",
    padding: 12,
  },
  userChipActive: {
    borderColor: "rgba(246, 157, 140, 0.9)",
    backgroundColor: "rgba(70, 70, 98, 0.9)",
  },
  userChipName: {
    color: "#dce7f1",
    fontWeight: "700",
    fontSize: 15,
  },
  userChipNameActive: {
    color: "#ffd4c8",
  },
  userChipMeta: {
    color: "#9eb2c6",
    marginTop: 2,
    fontSize: 12,
  },
  formBlock: {
    marginTop: 16,
  },
  loginButton: {
    marginTop: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#f28b74",
  },
  loginButtonDisabled: {
    opacity: 0.75,
  },
  loginButtonText: {
    color: "#162739",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  error: {
    marginTop: 10,
    color: "#ffb6ad",
    fontWeight: "700",
    fontSize: 13,
  },
});
