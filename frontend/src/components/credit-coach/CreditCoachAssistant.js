/**
 * Credit Coach Assistant Component
 * Provides a chat-like interface for credit guidance questions
 * Includes quick prompt suggestions and formatted responses
 */

import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppTheme } from "../../theme/ThemeContext";
import { sendCoachMessage } from "../../services/creditCoachService";
import RecommendationCard from "./RecommendationCard";

const QUICK_PROMPTS = [
  { id: 1, text: "Why is my score low?" },
  { id: 2, text: "How can I improve?" },
  { id: 3, text: "What affected my score?" },
  { id: 4, text: "Show strengths & weaknesses" },
];

function buildLocalFallbackAnswer(riskResult) {
  const riskScore = riskResult?.risk_score ?? "--";
  const riskGrade = riskResult?.risk_grade ?? "Unknown";
  const factors = (riskResult?.risk_factors || []).map((f) => f.factor).slice(0, 3);
  const factorText = factors.length
    ? `Key factors: ${factors.join(", ")}.`
    : "Key factors were not available in this response.";

  return `I couldn't reach the live coach service right now. Your current risk is ${riskGrade} (${riskScore}/100). ${factorText} Focus on lowering debt-to-income, maintaining on-time payments, and improving loan terms.`;
}

export default function CreditCoachAssistant({ riskResult }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPrompts, setShowPrompts] = useState(true);

  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  async function handleSendMessage(message) {
    if (!message.trim()) {
      return;
    }

    // Create context from current risk result
    if (!riskResult) {
      setError("No analysis available. Please run risk analysis first.");
      return;
    }

    // Add user message to chat
    setMessages((prev) => [...prev, { type: "user", text: message }]);
    setInputValue("");
    setShowPrompts(false);
    setLoading(true);
    setError("");

    try {
      const payload = {
        user_message: message,
        risk_score: riskResult.risk_score,
        risk_grade: riskResult.risk_grade,
        loan_percent_income: riskResult.loan_percent_income || 0.3,
        person_emp_length: riskResult.person_emp_length || 5,
        loan_grade: riskResult.loan_grade || "C",
        cb_person_default_on_file: riskResult.cb_person_default_on_file || "N",
        loan_int_rate: riskResult.loan_int_rate || 10,
        person_age: riskResult.person_age || 35,
        person_income: riskResult.person_income || 500000,
        top_risk_factors: riskResult.risk_factors?.map((f) => f.factor) || [],
      };

      const response = await sendCoachMessage(payload);

      // Add coach response
      setMessages((prev) => [
        ...prev,
        {
          type: "coach",
          answer: response.answer,
          intent: response.intent_detected,
          negativeFactors: response.top_negative_factors,
          positiveFactors: response.top_positive_factors,
          recommendations: response.recommendations,
        },
      ]);
    } catch (err) {
      const debugMessage = err?.message || "Coach request failed";
      console.error("Credit coach chat failed:", debugMessage);
      setError(`Coach is temporarily unavailable. ${debugMessage}`);
      setMessages((prev) => [
        ...prev,
        {
          type: "coach",
          answer: buildLocalFallbackAnswer(riskResult),
          intent: "general",
          negativeFactors: riskResult?.risk_factors?.map((f) => f.factor).slice(0, 3) || [],
          positiveFactors: [],
          recommendations: [
            "Try again in a few seconds; server may be waking up",
            "Run What-If Simulator to test profile improvements",
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }

    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 && showPrompts && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Welcome to AI Credit Coach</Text>
            <Text style={styles.emptySubtitle}>
              Ask me anything about your credit profile and ways to improve
            </Text>
          </View>
        )}

        {messages.map((msg, idx) => (
          <View key={idx} style={styles.messageBubbleContainer}>
            {msg.type === "user" ? (
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{msg.text}</Text>
              </View>
            ) : msg.type === "error" ? (
              <View style={styles.errorBubble}>
                <Text style={styles.errorText}>{msg.text}</Text>
              </View>
            ) : (
              <View style={styles.coachBubbleContainer}>
                <View style={styles.coachBubble}>
                  <Text style={styles.coachText}>{msg.answer}</Text>
                </View>

                {/* Factors Display */}
                {msg.negativeFactors && msg.negativeFactors.length > 0 && (
                  <View style={styles.factorsSection}>
                    <Text style={styles.factorsTitle}>Risk Factors:</Text>
                    {msg.negativeFactors.slice(0, 3).map((factor, i) => (
                      <Text key={i} style={styles.factorItem}>
                        • {factor}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Recommendations Display */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <View style={styles.recommendationsSection}>
                    <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                    {msg.recommendations.slice(0, 3).map((rec, i) => (
                      <Text key={i} style={styles.recommendationItem}>
                        → {rec}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={theme.colors.accent}
              style={{ marginVertical: 12 }}
            />
            <Text style={styles.loadingText}>Coach is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Prompts */}
      {showPrompts && messages.length === 0 && (
        <View style={styles.promptsContainer}>
          <Text style={styles.promptsLabel}>Quick Questions:</Text>
          <View style={styles.promptsGrid}>
            {QUICK_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt.id}
                style={({ pressed }) => [
                  styles.promptChip,
                  pressed && styles.promptChipPressed,
                ]}
                onPress={() => handleSendMessage(prompt.text)}
              >
                <Text style={styles.promptText}>{prompt.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputBox, { borderColor: theme.colors.border }]}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything about your credit..."
            placeholderTextColor={theme.colors.textSecondary}
            value={inputValue}
            onChangeText={setInputValue}
            multiline
            maxLength={300}
            editable={!loading}
          />
          <Pressable
            onPress={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || loading}
            style={({ pressed }) => [
              styles.sendButton,
              (pressed || !inputValue.trim() || loading) && styles.sendButtonDisabled,
            ]}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      overflow: "hidden",
    },

    messagesContainer: {
      flex: 1,
      paddingHorizontal: 14,
    },

    messagesContent: {
      paddingTop: 16,
      paddingBottom: 12,
      flexGrow: 1,
      justifyContent: "flex-start",
    },

    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 40,
      marginBottom: 40,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },

    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: "center",
      maxWidth: 280,
      lineHeight: 18,
    },

    messageBubbleContainer: {
      marginVertical: 8,
      flexDirection: "row",
    },

    userBubble: {
      alignSelf: "flex-end",
      maxWidth: "75%",
      backgroundColor: theme.colors.accent,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },

    userText: {
      fontSize: 14,
      color: "#ffffff",
      lineHeight: 18,
    },

    coachBubbleContainer: {
      alignSelf: "flex-start",
      maxWidth: "85%",
      marginRight: 8,
    },

    coachBubble: {
      backgroundColor: theme.colors.cardMuted,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    coachText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      lineHeight: 18,
    },

    factorsSection: {
      marginTop: 10,
      padding: 12,
      backgroundColor: `${theme.colors.danger}15`,
      borderRadius: 10,
    },

    factorsTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      marginBottom: 6,
    },

    factorItem: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
      lineHeight: 16,
    },

    recommendationsSection: {
      marginTop: 10,
      padding: 12,
      backgroundColor: `${theme.colors.success}15`,
      borderRadius: 10,
    },

    recommendationsTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      marginBottom: 6,
    },

    recommendationItem: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
      lineHeight: 16,
    },

    errorBubble: {
      alignSelf: "flex-start",
      maxWidth: "85%",
      backgroundColor: `${theme.colors.danger}20`,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.colors.danger,
    },

    errorText: {
      fontSize: 14,
      color: theme.colors.danger,
      lineHeight: 18,
    },

    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 20,
    },

    loadingText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 8,
    },

    promptsContainer: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
    },

    promptsLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginBottom: 10,
    },

    promptsGrid: {
      gap: 8,
    },

    promptChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.chipBg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    promptChipPressed: {
      backgroundColor: theme.colors.accent,
    },

    promptText: {
      fontSize: 12,
      color: theme.colors.chipText,
      fontWeight: "500",
    },

    errorBanner: {
      backgroundColor: `${theme.colors.danger}20`,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.danger,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },

    errorBannerText: {
      fontSize: 12,
      color: theme.colors.danger,
    },

    inputContainer: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },

    inputBox: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
    },

    input: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textPrimary,
      maxHeight: 80,
      paddingVertical: 6,
      paddingHorizontal: 0,
    },

    sendButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: theme.colors.accent,
    },

    sendButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      opacity: 0.5,
    },

    sendButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#ffffff",
    },
  });
}
