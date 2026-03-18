import React, { useEffect } from "react";
import { View, Image, StyleSheet, Animated, Easing, Text } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";

export default function SplashScreenComponent({ isVisible }) {
  const { theme } = useAppTheme();
  const loaderWidth = new Animated.Value(0);

  useEffect(() => {
    if (isVisible) {
      loaderWidth.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(loaderWidth, {
            toValue: 100,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(loaderWidth, {
            toValue: 0,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isVisible, loaderWidth]);

  if (!isVisible) return null;

  const loaderPercentage = loaderWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.mode === "dark" ? "#0b1f2a" : "#4A90E2",
        },
      ]}
    >
      <Image
        source={require("../../assets/applogo1.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View
        style={[
          styles.loaderContainer,
          {
            borderColor:
              theme.mode === "dark"
                ? "rgba(255,255,255,0.3)"
                : "rgba(255,255,255,0.4)",
          },
        ]}
      >
        <Animated.View
          style={[
            styles.loaderBar,
            {
              width: loaderPercentage,
              backgroundColor:
                theme.mode === "dark"
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.95)",
              borderRadius: 2,
              boxShadow:
                theme.mode === "dark"
                  ? "0 0 8px rgba(255,255,255,0.6)"
                  : "0 0 12px rgba(255,255,255,0.8)",
            },
          ]}
        />
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.loadingText,
            {
              color:
                theme.mode === "dark"
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(255,255,255,0.8)",
            },
          ]}
        >
          Initializing...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logo: {
    width: 240,
    height: 240,
    marginBottom: 80,
  },
  loaderContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 32,
  },
  loaderBar: {
    height: "100%",
    borderRadius: 2,
  },
  textContainer: {
    marginTop: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
    textAlign: "center",
  },
});
