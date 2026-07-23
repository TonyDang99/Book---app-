import { StyleSheet } from "react-native";

// Tab navigation
export const withAlpha = (hex, alpha) => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const getTabScreenOptions = (colors) => ({
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textSecondary,
  headerTitleStyle: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  headerShadowVisible: false,
});

export const getTabBarDockStyle = (bottomInset) => ({
  bottom: Math.max(bottomInset, 12),
});

export const getTabBarShellStyle = (colors, glassBorder, isDarkMode) => ({
  borderColor: glassBorder,
  shadowColor: colors.black,
  shadowOpacity: isDarkMode ? 0.36 : 0.16,
});

export const getGlassBackgroundStyle = (backgroundColor) => ({ backgroundColor });

export const getGlassHighlightStyle = (colors, isDarkMode) => ({
  backgroundColor: withAlpha(colors.white, isDarkMode ? 0.08 : 0.38),
});

export const getActiveLensStyle = (
  horizontalPadding,
  itemWidth,
  activeGlass,
  colors,
  isDarkMode
) => ({
  left: horizontalPadding,
  width: itemWidth,
  backgroundColor: activeGlass,
  borderColor: withAlpha(colors.white, isDarkMode ? 0.18 : 0.7),
  shadowColor: colors.primary,
  shadowOpacity: isDarkMode ? 0.24 : 0.18,
});

export const getActiveLensGlowStyle = (backgroundColor) => ({ backgroundColor });

export const getTabLabelColorStyle = (color) => ({ color });

export const getActiveLensAnimatedStyle = (activeIndex, morphScale, itemWidth) => {
  "worklet";
  return {
    transform: [
      { translateX: activeIndex.value * itemWidth },
      { scaleX: morphScale.value },
      { scaleY: 2 - morphScale.value },
    ],
  };
};

export const getIconAnimatedStyle = (iconProgress) => {
  "worklet";
  return {
    transform: [
      { translateY: -2 * iconProgress.value },
      { scale: 1 + iconProgress.value * 0.1 },
    ],
  };
};

export const getLabelAnimatedStyle = (iconProgress) => {
  "worklet";
  return {
    opacity: 0.72 + iconProgress.value * 0.28,
    transform: [{ translateY: -iconProgress.value }],
  };
};

export const tabsStyles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  tabBadge: {
    position: "absolute",
    top: -7,
    right: -12,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e74c3c",
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  tabBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },
  tabBarDock: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 70,
  },
  tabBarShell: {
    flex: 1,
    borderRadius: 30,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 26,
    elevation: 14,
  },
  tabItemsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    gap: 2,
  },
  activeLens: {
    position: "absolute",
    top: 8,
    bottom: 8,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  activeLensGlow: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: -10,
    height: 22,
    borderRadius: 11,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  glassHighlight: {
    position: "absolute",
    top: 1,
    left: 18,
    right: 18,
    height: 1,
    borderRadius: 1,
  },
});

// Theme toggle
export const createThemeToggleStyles = (colors, isDarkMode) =>
  StyleSheet.create({
    toggle: {
      width: 63,
      height: 40,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardBackground,
      borderColor: colors.border,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
      overflow: "hidden",
    },
    togglePressed: {
      opacity: 0.85,
    },
    iconWrap: {
      width: 29,
      height: 29,
      borderRadius: 20,
      borderWidth: 3,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDarkMode ? colors.primary : colors.inputBackground,
      borderColor: colors.border,
    },
  });

export const getToggleIconAnimationStyle = (slideAnim) => ({
  transform: [
    {
      translateX: slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-14, 14],
      }),
    },
  ],
});

// Application layout
export const layoutStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

// Loader
export const createLoaderStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
  });

// Safe screen
export const createSafeScreenStyles = (colors, topInset) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: topInset,
      backgroundColor: colors.background,
    },
  });
