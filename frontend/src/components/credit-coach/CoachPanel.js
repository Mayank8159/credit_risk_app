/**
 * AI Credit Coach Panel Component
 * Main container with tabbed interface for Assistant and What-If Simulator
 * Integrates both features seamlessly into existing app
 */

import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAppTheme } from "../../theme/ThemeContext";
import CreditCoachAssistant from "./CreditCoachAssistant";
import WhatIfSimulator from "./WhatIfSimulator";

export default function CoachPanel({ riskResult }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  const [activeTab, setActiveTab] = useState("assistant");
  const tabIndicatorX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toValue = activeTab === "assistant" ? 0 : 1;
    Animated.spring(tabIndicatorX, {
      toValue,
      friction: 8,
      tension: 80,
      useNativeDriver: false,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabIndicatorX, fadeAnim]);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    fadeAnim.setValue(0);
  };

  const indicatorWidth = "50%";

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.card, theme.colors.cardMuted]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>AI Credit Coach</Text>
        <Text style={styles.headerSubtitle}>Your personal credit improvement guide</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.tabsContainer}>
          <Pressable
            style={styles.tabButton}
            onPress={() => handleTabPress("assistant")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "assistant" && styles.tabTextActive,
              ]}
            >
              💬 Assistant
            </Text>
          </Pressable>
          <Pressable
            style={styles.tabButton}
            onPress={() => handleTabPress("simulator")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "simulator" && styles.tabTextActive,
              ]}
            >
              📊 What-If
            </Text>
          </Pressable>
        </View>

        {/* Animated Tab Indicator */}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              backgroundColor: theme.colors.accent,
              transform: [
                {
                  translateX: tabIndicatorX.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, "100%"],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {/* Content Area */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {activeTab === "assistant" && (
          <CreditCoachAssistant riskResult={riskResult} />
        )}
        {activeTab === "simulator" && (
          <WhatIfSimulator riskResult={riskResult} />
        )}
      </Animated.View>

      {/* Footer Info */}
      <View style={[styles.footerInfo, { backgroundColor: theme.colors.cardMuted }]}>
        <Text style={styles.footerText}>
          💡 Tip: Use the Assistant to understand your score, then explore improvements with What-If
        </Text>
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      overflow: "hidden",
      marginTop: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    header: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    headerTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: 2,
    },

    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },

    tabBar: {
      flexDirection: "row",
      borderBottomWidth: 1,
      backgroundColor: theme.colors.card,
    },

    tabsContainer: {
      flex: 1,
      flexDirection: "row",
    },

    tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    tabText: {
      fontSize: 13,
      fontWeight: "500",
      color: theme.colors.textSecondary,
    },

    tabTextActive: {
      color: theme.colors.accent,
      fontWeight: "600",
    },

    tabIndicator: {
      position: "absolute",
      bottom: 0,
      left: 0,
      height: 2,
      width: "50%",
    },

    content: {
      flex: 1,
    },

    footerInfo: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    footerText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontStyle: "italic",
      lineHeight: 15,
    },
  });
}
