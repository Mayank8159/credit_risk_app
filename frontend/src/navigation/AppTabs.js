import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DemoDashboardScreen from "../screens/DemoDashboardScreen";
import InsightsScreen from "../screens/InsightsScreen";
import CardsScreen from "../screens/CardsScreen";
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
  if (routeName === "Cards") {
    return focused ? "card" : "card-outline";
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
  const barHeight = 62 + Math.max(insets.bottom, 6);
  const badgeCounts = {
    insights: 2,
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
          left: 0,
          right: 0,
          bottom: 0,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          height: barHeight,
          paddingHorizontal: 10,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 10),
          overflow: "hidden",
          shadowColor: theme.mode === "dark" ? "#000000" : "#1e6fd9",
          shadowOffset: {
            width: 0,
            height: theme.mode === "dark" ? 12 : 8,
          },
          shadowOpacity: theme.mode === "dark" ? 0.35 : 0.14,
          shadowRadius: theme.mode === "dark" ? 20 : 12,
          elevation: theme.mode === "dark" ? 12 : 7,
        },
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "900",
          marginTop: 2,
          letterSpacing: 0.7,
          textTransform: "uppercase",
        },
        tabBarItemStyle: {
          borderRadius: 20,
          marginHorizontal: 3,
          marginTop: 4,
          marginBottom: 4,
          overflow: "hidden",
        },
        tabBarActiveBackgroundColor:
          theme.mode === "dark"
            ? "rgba(128, 176, 255, 0.26)"
            : "rgba(255, 255, 255, 0.35)",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <View style={styles.tabBackgroundShell}>
            <BlurView
              tint={theme.mode === "dark" ? "dark" : "light"}
              intensity={theme.mode === "dark" ? 74 : 88}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={
                theme.mode === "dark"
                  ? ["rgba(125,170,255,0.18)", "rgba(25,42,74,0.34)"]
                  : ["rgba(255,255,255,0.64)", "rgba(198,223,255,0.28)"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                styles.tabOverlay,
                {
                  backgroundColor:
                    theme.mode === "dark"
                      ? "rgba(8, 14, 26, 0.54)"
                      : "rgba(255, 255, 255, 0.42)",
                  borderColor: theme.mode === "dark"
                    ? "rgba(218,232,255,0.20)"
                    : "rgba(255, 255, 255, 0.72)",
                },
              ]}
            />
            <LinearGradient
              pointerEvents="none"
              colors={
                theme.mode === "dark"
                  ? ["rgba(255,255,255,0.24)", "rgba(255,255,255,0.00)"]
                  : ["rgba(255,255,255,0.88)", "rgba(255,255,255,0.00)"]
              }
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.topSheen}
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
            fontWeight: "900",
            fontSize: 10,
            borderRadius: 10,
            paddingHorizontal: 5,
            paddingVertical: 2,
            minWidth: 20,
            textAlign: "center",
          },
        }}
      >
        {() => <InsightsScreen session={session} />}
      </Tab.Screen>
      <Tab.Screen name="Cards">{() => <CardsScreen session={session} />}</Tab.Screen>
      <Tab.Screen name="Settings">{() => <SettingsScreen onLogout={onLogout} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBackgroundShell: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  tabOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
  },
  topSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 20,
  },
});
