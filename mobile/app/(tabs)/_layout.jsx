import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTheme from "../../hooks/useTheme";

const withAlpha = (hex, alpha) => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const tabBottomOffset = Math.max(insets.bottom, 12);
  const glassBackground = withAlpha(colors.cardBackground, isDarkMode ? 0.52 : 0.68);
  const glassBorder = withAlpha(colors.white, isDarkMode ? 0.16 : 0.62);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerTitleStyle: {
          color: colors.textPrimary,
          fontWeight: "600",
        },
        headerShadowVisible: false,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: tabBottomOffset,
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: glassBorder,
          borderRadius: 28,
          backgroundColor: Platform.OS === "ios" ? "transparent" : glassBackground,
          overflow: "hidden",
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: isDarkMode ? 0.35 : 0.14,
          shadowRadius: 24,
          elevation: 14,
        },
        tabBarBackground: () => (
          <GlassTabBarBackground
            backgroundColor={glassBackground}
            highlightColor={withAlpha(colors.white, isDarkMode ? 0.08 : 0.36)}
            tint={isDarkMode ? "dark" : "light"}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function GlassTabBarBackground({ backgroundColor, highlightColor, tint }) {
  return (
    <BlurView intensity={64} tint={tint} style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
      <View style={[styles.glassHighlight, { backgroundColor: highlightColor }]} />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    borderRadius: 22,
    marginHorizontal: 4,
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
