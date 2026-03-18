import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../theme/ThemeContext";

const SAMPLE_MESSAGES = [
  {
    id: "m1",
    title: "Policy Alert",
    body: "Debt-to-income threshold warning generated for high-risk profile.",
    time: "2m ago",
  },
  {
    id: "m2",
    title: "Model Update",
    body: "Latest inference completed successfully on backend service.",
    time: "1h ago",
  },
  {
    id: "m3",
    title: "Portfolio Notice",
    body: "NPC rate moved by 0.2% since the previous cycle.",
    time: "Yesterday",
  },
];

export default function MessagesScreen() {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <LinearGradient colors={theme.gradients.page} style={styles.gradientBackdrop} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.caption}>Messages</Text>
        <Text style={styles.title}>Operational Inbox</Text>

        {SAMPLE_MESSAGES.map((message) => (
          <View key={message.id} style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageTitle}>{message.title}</Text>
              <Text style={styles.messageTime}>{message.time}</Text>
            </View>
            <Text style={styles.messageBody}>{message.body}</Text>
          </View>
        ))}
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
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 120,
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
    messageCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 14,
    },
    messageHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    messageTitle: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
      fontSize: 16,
    },
    messageTime: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    messageBody: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
    },
  });
}
