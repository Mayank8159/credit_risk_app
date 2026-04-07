/**
 * RecommendationCard Component
 * Displays a single recommendation or insight in a clean card format
 * Matches existing design system with gradients and consistent spacing
 */

import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../theme/ThemeContext";

export default function RecommendationCard({ icon, title, description, accent }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  // Color mapping for accent indicators
  const accentColor = {
    success: theme.colors.success,
    warning: theme.colors.warning,
    info: theme.colors.accent,
    danger: theme.colors.danger,
  }[accent] || theme.colors.accent;

  return (
    <LinearGradient
      colors={[theme.colors.card, theme.colors.cardMuted]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        {
          borderLeftColor: accentColor,
          borderLeftWidth: 4,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.icon, { color: accentColor }]}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {description && <Text style={styles.description}>{description}</Text>}
    </LinearGradient>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    card: {
      marginBottom: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    icon: {
      fontSize: 18,
      marginRight: 10,
      width: 24,
      textAlign: "center",
    },
    title: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    description: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginLeft: 34,
    },
  });
}
