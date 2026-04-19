import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";

export default function LoanCategorySelector({ options, selectedKey, onSelect }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Loan Category</Text>
      <View style={styles.chipsRow}>
        {options.map((item) => {
          const isActive = item.key === selectedKey;
          return (
            <Pressable
              key={item.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(item.key)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    wrapper: {
      marginBottom: 14,
    },
    label: {
      color: theme.colors.textSecondary,
      marginBottom: 8,
      fontSize: 12,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      fontWeight: "600",
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    chipActive: {
      borderColor: theme.colors.accentSecondary,
      backgroundColor: theme.colors.chipBg,
    },
    chipText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
    },
    chipTextActive: {
      color: theme.colors.chipText,
    },
  });
}
