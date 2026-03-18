import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import DemoDashboardScreen from "../screens/DemoDashboardScreen";
import InsightsScreen from "../screens/InsightsScreen";
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
  return focused ? "settings" : "settings-outline";
}

export default function AppTabs({
  session,
  demoUsers,
  switchLoading,
  onQuickSwitch,
  onLogout,
}) {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBg,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={getTabIconName(route.name, focused)} size={size} color={color} />
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
      <Tab.Screen name="Insights">{() => <InsightsScreen session={session} />}</Tab.Screen>
      <Tab.Screen name="Settings">{() => <SettingsScreen onLogout={onLogout} />}</Tab.Screen>
    </Tab.Navigator>
  );
}
