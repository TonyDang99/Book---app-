import { Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../hooks/useTheme";
import { useThemeStore } from "../store/themeStore";
import { useEffect, useMemo, useRef } from "react";
import {
  createThemeToggleStyles as createStyles,
  getToggleIconAnimationStyle,
} from "../assets/styles/shared.styles";

export default function ThemeToggle({ style }) {
  const { colors, isDarkMode } = useTheme();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

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
        pressed && styles.togglePressed,
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.iconWrap,
          getToggleIconAnimationStyle(slideAnim),
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
