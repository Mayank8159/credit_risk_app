import { StyleSheet, Text, TextInput, View } from "react-native";

export default function InputField({ label, value, onChangeText, secureTextEntry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#89a1ad"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    color: "#d4e5ee",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
