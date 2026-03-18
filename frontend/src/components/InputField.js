import { StyleSheet, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";

export default function InputField({ label, value, onChangeText, secureTextEntry }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor={theme.colors.textSecondary}
      />
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      marginBottom: 14,
    },
    label: {
      color: theme.colors.textSecondary,
      marginBottom: 7,
      fontSize: 12,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      fontWeight: "600",
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 13,
      color: theme.colors.textPrimary,
      fontSize: 14,
      backgroundColor: theme.colors.inputBg,
    },
  });
}
