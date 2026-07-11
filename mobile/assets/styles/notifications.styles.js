import { StyleSheet } from "react-native";

const createStyles = (colors, isDarkMode = false) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.cardBackground,
    },
    headerTitle: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
    },
    markAllButton: {
      minHeight: 34,
      justifyContent: "center",
      paddingHorizontal: 10,
      borderRadius: 9,
    },
    markAllButtonPressed: {
      backgroundColor: colors.inputBackground,
    },
    markAllText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "700",
    },
    list: {
      padding: 14,
      paddingBottom: 110,
      flexGrow: 1,
    },
    notificationCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 13,
      marginBottom: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardBackground,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDarkMode ? 0.18 : 0.06,
      shadowRadius: 4,
      elevation: 1,
    },
    unreadCard: {
      borderColor: colors.primary,
      backgroundColor: colors.inputBackground,
    },
    cardPressed: {
      opacity: 0.74,
      transform: [{ scale: 0.99 }],
    },
    avatarWrap: {
      position: "relative",
      marginRight: 12,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.inputBackground,
    },
    typeBadge: {
      position: "absolute",
      right: -3,
      bottom: -2,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.cardBackground,
    },
    content: {
      flex: 1,
      paddingTop: 1,
    },
    message: {
      color: colors.textDark,
      fontSize: 14,
      lineHeight: 20,
    },
    time: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 5,
    },
    unreadDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      marginTop: 7,
      marginLeft: 8,
      backgroundColor: colors.primary,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 36,
      paddingVertical: 60,
    },
    emptyIcon: {
      width: 76,
      height: 76,
      borderRadius: 38,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.inputBackground,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "700",
      marginTop: 16,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      marginTop: 6,
    },
  });

export default createStyles;
