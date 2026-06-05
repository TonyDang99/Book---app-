import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../hooks/useTheme";
import { useThemeStore } from "../store/themeStore";

export default function ThemeToggle({ style }) {
  const { colors, isDarkMode } = useTheme();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

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
        },
        style,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: isDarkMode ? colors.primary : colors.inputBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons
          name={isDarkMode ? "moon" : "sunny"}
          size={16}
          color={isDarkMode ? colors.white : colors.primary}
        />
      </View>
      <Text style={[styles.label, { color: colors.textPrimary }]}>
        {isDarkMode ? "Dark" : "Light"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    minWidth: 98,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
