import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DemoDashboardScreen from "../screens/DemoDashboardScreen";
import InsightsScreen from "../screens/InsightsScreen";
import MessagesScreen from "../screens/MessagesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useAppTheme } from "../theme/ThemeContext";

const Tab = createBottomTabNavigator();

function getTabIconName(routeName, focused) {
  if (routeName === "Home") {
    return focused ? "home" : "home-outline";
  }
  if (routeName === "Insights") {
    return focused ? "bar-chart" : "bar-chart-outline";
  }
  if (routeName === "Messages") {
    return focused ? "chatbubbles" : "chatbubbles-outline";
  }
  return focused ? "settings" : "settings-outline";
}

function AnimatedTabIcon({ color, size, focused, iconName, theme }) {
  const scaleValue = new Animated.Value(focused ? 1 : 0.85);

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1 : 0.85,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [focused, scaleValue]);

  const glowColor = focused
    ? theme.mode === "dark"
      ? "rgba(78, 123, 255, 0.5)"
      : "rgba(47, 125, 255, 0.4)"
    : "transparent";

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
          alignItems: "center",
          justifyContent: "center",
          width: size + 12,
          height: size + 12,
          borderRadius: (size + 12) / 2,
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: focused ? 0.8 : 0,
          shadowRadius: focused ? 8 : 0,
          elevation: focused ? 6 : 0,
        },
      ]}
    >
      <Ionicons name={iconName} size={size} color={color} />
    </Animated.View>
  );
}

export default function AppTabs({
  session,
  demoUsers,
  switchLoading,
  onQuickSwitch,
  onLogout,
}) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const floatingBottom = Math.max(insets.bottom, 10);
  const barHeight = 62 + Math.max(insets.bottom, 6);
  const horizontalInset = Math.max(28, insets.left + 16, insets.right + 16);
  const badgeCounts = {
    insights: 2,
    messages: 5,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: {
          backgroundColor: "transparent",
        },
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopColor: "transparent",
          borderTopWidth: 0,
          position: "absolute",
          left: horizontalInset,
          right: horizontalInset,
          bottom: floatingBottom,
          borderRadius: 32,
          height: barHeight,
          paddingHorizontal: 8,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
          overflow: "hidden",
          shadowColor: theme.mode === "dark" ? "#000000" : "#1e6fd9",
          shadowOffset: {
            width: 0,
            height: theme.mode === "dark" ? 10 : 6,
          },
          shadowOpacity: theme.mode === "dark" ? 0.3 : 0.12,
          shadowRadius: theme.mode === "dark" ? 18 : 10,
          elevation: theme.mode === "dark" ? 11 : 6,
        },
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },
        tabBarItemStyle: {
          borderRadius: 18,
          marginHorizontal: 2,
          marginTop: 3,
          marginBottom: 3,
          overflow: "hidden",
        },
        tabBarActiveBackgroundColor:
          theme.mode === "dark" ? "rgba(78, 123, 255, 0.26)" : "rgba(47, 125, 255, 0.2)",
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <View style={styles.tabBackgroundShell}>
            <BlurView
              tint={theme.mode === "dark" ? "dark" : "light"}
              intensity={theme.mode === "dark" ? 58 : 72}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                styles.tabOverlay,
                {
                  backgroundColor:
                    theme.mode === "dark"
                      ? "rgba(12, 23, 40, 0.74)"
                      : "rgba(255, 255, 255, 0.72)",
                  borderColor: theme.colors.border,
                },
              ]}
            />
          </View>
        ),
        tabBarIcon: ({ color, size, focused }) => (
          <AnimatedTabIcon
            color={color}
            size={size}
            focused={focused}
            iconName={getTabIconName(route.name, focused)}
            theme={theme}
          />
        ),
      })}
    >
      <Tab.Screen name="Home">
        {() => (
          <DemoDashboardScreen
            session={session}
            demoUsers={demoUsers}
            switchLoading={switchLoading}
            onQuickSwitch={onQuickSwitch}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Insights"
        options={{
          tabBarBadge: badgeCounts.insights,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.accentSecondary,
            color: "#001327",
            fontWeight: "800",
          },
        }}
      >
        {() => <InsightsScreen session={session} />}
      </Tab.Screen>
      <Tab.Screen
        name="Messages"
        options={{
          tabBarBadge: badgeCounts.messages,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.danger,
            color: "#fff",
            fontWeight: "800",
          },
        }}
      >
        {() => <MessagesScreen />}
      </Tab.Screen>
      <Tab.Screen name="Settings">{() => <SettingsScreen onLogout={onLogout} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBackgroundShell: {
    flex: 1,
    borderRadius: 32,
    overflow: "hidden",
  },
  tabOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 1,
  },
});
