import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../theme/ThemeContext";

export default function SettingsScreen({ onLogout }) {
  const { isDark, theme, toggleTheme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.root}>
      <LinearGradient colors={theme.gradients.page} style={styles.gradientBackdrop} />
      <View style={styles.content}>
        <Text style={styles.caption}>Settings</Text>
        <Text style={styles.title}>Appearance & Access</Text>

        <View style={styles.card}>
          <Text style={styles.rowLabel}>Theme</Text>
          <Text style={styles.rowValue}>{isDark ? "Dark" : "Light"}</Text>
          <Pressable style={styles.button} onPress={toggleTheme}>
            <LinearGradient colors={theme.gradients.button} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Switch to {isDark ? "Light" : "Dark"} Mode</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.rowLabel}>Session</Text>
          <Text style={styles.rowValue}>Authenticated</Text>
          <Pressable style={styles.secondaryButton} onPress={onLogout}>
            <Text style={styles.secondaryButtonText}>Sign out</Text>
          </Pressable>
        </View>
      </View>
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
    rowLabel: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    rowValue: {
      marginTop: 6,
      marginBottom: 10,
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
    },
    button: {
      borderRadius: 12,
      overflow: "hidden",
    },
    buttonGradient: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },
    buttonText: {
      color: "#f4fbff",
      fontWeight: "700",
    },
    secondaryButton: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      paddingVertical: 11,
      alignItems: "center",
    },
    secondaryButtonText: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
    },
  });
}
