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
    color: "#c5d5e4",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(126, 152, 177, 0.45)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#f2f8fd",
    backgroundColor: "rgba(20, 37, 54, 0.85)",
  },
});
