import { Pressable, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../hooks/useTheme";
import { useThemeStore } from "../store/themeStore";
import { useEffect, useRef } from "react";

export default function ThemeToggle({ style }) {
  const { colors, isDarkMode } = useTheme();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isDarkMode ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [isDarkMode, slideAnim]);

  return (
    <Pressable
      accessibilityLabel={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDarkMode }}
      hitSlop={8}
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.toggle,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          shadowColor: colors.black,
          opacity: pressed ? 0.85 : 1,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.iconWrap,
          {
            backgroundColor: isDarkMode ? colors.primary : colors.inputBackground,
            borderColor: colors.border,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-14, 14],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons
          name={isDarkMode ? "moon" : "sunny"}
          size={16}
          color={isDarkMode ? colors.white : colors.primary}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 63,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 29,
    height: 29,
    borderRadius:20,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
});
