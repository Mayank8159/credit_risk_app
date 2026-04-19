import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";

export default function BankSelector({ options, selectedKey, onSelect }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Bank Selection</Text>
      {options.map((bank) => {
        const isActive = bank.key === selectedKey;
        return (
          <Pressable
            key={bank.key}
            style={[styles.bankCard, isActive && styles.bankCardActive]}
            onPress={() => onSelect(bank.key)}
          >
            <View>
              <Text style={[styles.bankName, isActive && styles.bankNameActive]}>{bank.label}</Text>
              <Text style={styles.bankMeta}>ROI {bank.annualRate}% p.a.</Text>
            </View>
            <View style={[styles.dot, isActive && styles.dotActive]} />
          </Pressable>
        );
      })}
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
    bankCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      paddingHorizontal: 12,
      paddingVertical: 11,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    bankCardActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.cardMuted,
    },
    bankName: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
    bankNameActive: {
      color: theme.colors.accent,
    },
    bankMeta: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    dot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: "transparent",
    },
    dotActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accent,
    },
  });
}
