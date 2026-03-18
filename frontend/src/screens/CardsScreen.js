import { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Animated, Easing, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../theme/ThemeContext";

const USER_CARD_PROFILES = {
  demo_low: {
    accountType: "Demi Sapphire",
    cardTier: "SAPPHIRE",
    cardNumber: "4723 56XX XXXX 1892",
    accountNumber: "DM-DLOW-9812-1140",
    ifsc: "DEMI0001301",
    branch: "Demi Residency Branch",
    availableBalance: 845600,
    creditLimit: 400000,
    validThru: "05/30",
    cardColors: {
      light: ["#f1f8ff", "#d6ecff", "#b7dbff"],
      dark: ["#162233", "#1f3652", "#0f1b2b"],
    },
  },
  demo_moderate: {
    accountType: "Demi Platinum",
    cardTier: "PLATINUM",
    cardNumber: "5224 91XX XXXX 7845",
    accountNumber: "DM-DMOD-7845-2291",
    ifsc: "DEMI0002471",
    branch: "Demi Prime Branch",
    availableBalance: 2845600,
    creditLimit: 1200000,
    validThru: "09/31",
    cardColors: {
      light: ["#f8fbff", "#e6edf7", "#cfd8e6"],
      dark: ["#232a3a", "#40495d", "#1a1f2b"],
    },
  },
  demo_high: {
    accountType: "Demi Signature Metal",
    cardTier: "SIGNATURE",
    cardNumber: "5487 33XX XXXX 9014",
    accountNumber: "DM-DHIG-9014-6630",
    ifsc: "DEMI0003127",
    branch: "Demi Capital Branch",
    availableBalance: 498200,
    creditLimit: 800000,
    validThru: "11/29",
    cardColors: {
      light: ["#f3f3f5", "#dadce2", "#b4b9c4"],
      dark: ["#2a2a2f", "#4a4f59", "#1b1d23"],
    },
  },
  default: {
    accountType: "Demi Platinum",
    cardTier: "PLATINUM",
    cardNumber: "5224 91XX XXXX 7845",
    accountNumber: "DM-DEMI-7845-2291",
    ifsc: "DEMI0002471",
    branch: "Demi Prime Branch",
    availableBalance: 2845600,
    creditLimit: 1200000,
    validThru: "09/31",
    cardColors: {
      light: ["#f8fbff", "#e6edf7", "#cfd8e6"],
      dark: ["#232a3a", "#40495d", "#1a1f2b"],
    },
  },
};

function getAccountDetails(session) {
  const fullName = session?.user?.full_name || "Demi Account Holder";
  const username = session?.user?.username || "default";
  const role = session?.user?.role || "Premium Account";
  const profile = USER_CARD_PROFILES[username] || USER_CARD_PROFILES.default;

  return {
    holderName: fullName,
    role,
    ...profile,
  };
}

export default function CardsScreen({ session }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const account = getAccountDetails(session);
  const chipShimmerX = useRef(new Animated.Value(-64)).current;
  const cardGradient =
    theme.mode === "dark" ? account.cardColors.dark : account.cardColors.light;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(chipShimmerX, {
          toValue: 64,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(chipShimmerX, {
          toValue: -64,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerLoop.start();

    return () => {
      shimmerLoop.stop();
    };
  }, [chipShimmerX]);

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <LinearGradient colors={theme.gradients.page} style={styles.gradientBackdrop} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.caption}>Cards</Text>
        <Text style={styles.title}>{account.accountType}</Text>

        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardShell}
        >
          <View style={styles.cardTopRow}>
            <Text style={styles.cardBrand}>DEMI BANK</Text>
            <Text style={styles.cardTier}>{account.cardTier}</Text>
          </View>

          <View style={styles.chipShell}>
            <Image source={require("../../assets/cardchip.png")} style={styles.chipImage} />
            <LinearGradient
              colors={
                theme.mode === "dark"
                  ? ["rgba(255,255,255,0.28)", "rgba(255,255,255,0.06)", "transparent"]
                  : ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.18)", "transparent"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.chipShine}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.chipShimmerWrap,
                {
                  transform: [{ translateX: chipShimmerX }, { rotate: "22deg" }],
                },
              ]}
            >
              <LinearGradient
                colors={
                  theme.mode === "dark"
                    ? ["transparent", "rgba(255,255,255,0.4)", "transparent"]
                    : ["transparent", "rgba(255,255,255,0.58)", "transparent"]
                }
                start={{ x: 0, y: 0.2 }}
                end={{ x: 1, y: 0.8 }}
                style={styles.chipShimmer}
              />
            </Animated.View>
          </View>

          <Text style={styles.cardNumber}>{account.cardNumber}</Text>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardMetaLabel}>Card Holder</Text>
              <Text style={styles.cardMetaValue}>{account.holderName}</Text>
            </View>
            <View>
              <Text style={styles.cardMetaLabel}>Valid Thru</Text>
              <Text style={styles.cardMetaValue}>{account.validThru}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Demi Account Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Type</Text>
            <Text style={styles.detailValue}>{account.accountType}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Number</Text>
            <Text style={styles.detailValue}>{account.accountNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>IFSC</Text>
            <Text style={styles.detailValue}>{account.ifsc}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Branch</Text>
            <Text style={styles.detailValue}>{account.branch}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Role</Text>
            <Text style={styles.detailValue}>{account.role}</Text>
          </View>

          <View style={styles.summaryStrip}>
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryLabel}>Available Balance</Text>
              <Text style={styles.summaryValue}>₹{account.availableBalance.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryLabel}>Credit Limit</Text>
              <Text style={styles.summaryValue}>₹{account.creditLimit.toLocaleString("en-IN")}</Text>
            </View>
          </View>
        </View>
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
      marginBottom: 6,
    },
    cardShell: {
      borderRadius: 24,
      padding: 18,
      minHeight: 220,
      borderWidth: 1,
      borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(132, 149, 177, 0.45)",
      shadowColor: theme.mode === "dark" ? "#000" : "#9aa7bd",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: theme.mode === "dark" ? 0.3 : 0.2,
      shadowRadius: 16,
      elevation: 7,
    },
    cardTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardBrand: {
      color: theme.mode === "dark" ? "#e9edf5" : "#2f3d57",
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    cardTier: {
      color: theme.mode === "dark" ? "#d4d9e4" : "#4b5770",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1.1,
    },
    chipShell: {
      width: 56,
      height: 42,
      marginTop: 24,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: theme.mode === "dark" ? "rgba(255,255,255,0.24)" : "rgba(156, 171, 196, 0.45)",
      backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.38)",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    chipImage: {
      width: 48,
      height: 36,
      resizeMode: "contain",
    },
    chipShine: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 11,
    },
    chipShimmerWrap: {
      position: "absolute",
      width: 22,
      height: 84,
      top: -21,
      left: 0,
      opacity: theme.mode === "dark" ? 0.38 : 0.47,
    },
    chipShimmer: {
      flex: 1,
    },
    cardNumber: {
      marginTop: 20,
      color: theme.mode === "dark" ? "#f4f7fb" : "#26354f",
      fontSize: 23,
      fontWeight: "800",
      letterSpacing: 1.6,
    },
    cardBottomRow: {
      marginTop: 22,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardMetaLabel: {
      color: theme.mode === "dark" ? "#c2cbdb" : "#66738b",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 3,
    },
    cardMetaValue: {
      color: theme.mode === "dark" ? "#f2f5fa" : "#24344f",
      fontSize: 13,
      fontWeight: "700",
    },
    detailCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 14,
      gap: 10,
    },
    detailTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 2,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    detailLabel: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    detailValue: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    summaryStrip: {
      marginTop: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardMuted,
      paddingVertical: 12,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    summaryBlock: {
      flex: 1,
    },
    summaryDivider: {
      width: 1,
      height: "90%",
      backgroundColor: theme.colors.border,
      marginHorizontal: 10,
    },
    summaryLabel: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      marginBottom: 5,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    summaryValue: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "800",
    },
  });
}