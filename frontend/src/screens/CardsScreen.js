import { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Animated, Easing, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../theme/ThemeContext";

const USER_CARD_PROFILES = {
  aarav: {
    accountType: "Demi Sapphire",
    cardTier: "SAPPHIRE",
    cardNumber: "4723 56XX XXXX 1892",
    accountNumber: "DM-AARAV-9812-1140",
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
  nisha: {
    accountType: "Demi Platinum",
    cardTier: "PLATINUM",
    cardNumber: "5224 91XX XXXX 7845",
    accountNumber: "DM-NISHA-7845-2291",
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
  rohan: {
    accountType: "Demi Signature Metal",
    cardTier: "SIGNATURE",
    cardNumber: "5487 33XX XXXX 9014",
    accountNumber: "DM-ROHAN-9014-6630",
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

const USER_LOANS = {
  aarav: [
    {
      id: "L101",
      loanType: "Personal Loan",
      amount: 250000,
      disbursed: 250000,
      emi: 8450,
      tenure: "36 months",
      balance: 145000,
      nextDueDate: "2026-04-15",
      status: "Active",
    },
  ],
  nisha: [
    {
      id: "L201",
      loanType: "Home Loan",
      amount: 3500000,
      disbursed: 3500000,
      emi: 42500,
      tenure: "180 months",
      balance: 2850000,
      nextDueDate: "2026-03-25",
      status: "Active",
    },
    {
      id: "L202",
      loanType: "Car Loan",
      amount: 850000,
      disbursed: 850000,
      emi: 18900,
      tenure: "60 months",
      balance: 425000,
      nextDueDate: "2026-03-20",
      status: "Active",
    },
  ],
  rohan: [
    {
      id: "L301",
      loanType: "Business Loan",
      amount: 2500000,
      disbursed: 2500000,
      emi: 65400,
      tenure: "48 months",
      balance: 1250000,
      nextDueDate: "2026-03-28",
      status: "Active",
    },
    {
      id: "L302",
      loanType: "Education Loan",
      amount: 1200000,
      disbursed: 1200000,
      emi: 12800,
      tenure: "120 months",
      balance: 850000,
      nextDueDate: "2026-04-05",
      status: "Active",
    },
    {
      id: "L303",
      loanType: "Personal Loan",
      amount: 500000,
      disbursed: 500000,
      emi: 16700,
      tenure: "36 months",
      balance: 280000,
      nextDueDate: "2026-03-18",
      status: "Active",
    },
  ],
  default: [],
};

function getAccountDetails(session) {
  const fullName = session?.user?.full_name || "Demi Account Holder";
  const username = session?.user?.username || "default";
  const role = session?.user?.role || "Premium Account";
  const profile = USER_CARD_PROFILES[username] || USER_CARD_PROFILES.default;
  const loans = USER_LOANS[username] || USER_LOANS.default;

  return {
    holderName: fullName,
    role,
    loans,
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

        {account.loans && account.loans.length > 0 && (
          <View style={styles.loansSection}>
            <Text style={styles.loansTitle}>Active Loans</Text>
            {account.loans.map((loan) => (
              <View key={loan.id} style={styles.loanCard}>
                <View style={styles.loanHeader}>
                  <View>
                    <Text style={styles.loanType}>{loan.loanType}</Text>
                    <Text style={styles.loanId}>Loan ID: {loan.id}</Text>
                  </View>
                  <View style={styles.loanStatusBadge}>
                    <Text style={styles.loanStatus}>{loan.status}</Text>
                  </View>
                </View>

                <View style={styles.loanGrid}>
                  <View style={styles.loanGridItem}>
                    <Text style={styles.loanGridLabel}>Sanctioned</Text>
                    <Text style={styles.loanGridValue}>₹{loan.amount.toLocaleString("en-IN")}</Text>
                  </View>
                  <View style={styles.loanGridItem}>
                    <Text style={styles.loanGridLabel}>Outstanding</Text>
                    <Text style={styles.loanGridValue}>₹{loan.balance.toLocaleString("en-IN")}</Text>
                  </View>
                  <View style={styles.loanGridItem}>
                    <Text style={styles.loanGridLabel}>Monthly EMI</Text>
                    <Text style={styles.loanGridValue}>₹{loan.emi.toLocaleString("en-IN")}</Text>
                  </View>
                  <View style={styles.loanGridItem}>
                    <Text style={styles.loanGridLabel}>Tenure</Text>
                    <Text style={styles.loanGridValue}>{loan.tenure}</Text>
                  </View>
                </View>

                <View style={styles.loanFooter}>
                  <View>
                    <Text style={styles.loanFooterLabel}>Next Due</Text>
                    <Text style={styles.loanFooterValue}>{loan.nextDueDate}</Text>
                  </View>
                  <View style={styles.loanProgressBar}>
                    <View
                      style={[
                        styles.loanProgress,
                        {
                          width: `${((loan.amount - loan.balance) / loan.amount) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
    loansSection: {
      marginTop: 8,
      gap: 10,
    },
    loansTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 4,
    },
    loanCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      padding: 12,
      gap: 10,
    },
    loanHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    loanType: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 2,
    },
    loanId: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: "500",
    },
    loanStatusBadge: {
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(76, 175, 80, 0.25)"
          : "rgba(76, 175, 80, 0.15)",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    loanStatus: {
      color: theme.mode === "dark" ? "#66BB6A" : "#388E3C",
      fontSize: 11,
      fontWeight: "600",
    },
    loanGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    loanGridItem: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: theme.colors.cardMuted,
      borderRadius: 10,
      padding: 8,
    },
    loanGridLabel: {
      color: theme.colors.textSecondary,
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    loanGridValue: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    loanFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    loanFooterLabel: {
      color: theme.colors.textSecondary,
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 3,
    },
    loanFooterValue: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
    },
    loanProgressBar: {
      flex: 1,
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: "hidden",
    },
    loanProgress: {
      height: "100%",
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(78, 123, 255, 0.8)"
          : "rgba(30, 111, 217, 0.7)",
      borderRadius: 3,
    },
  });
}