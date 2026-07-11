import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import useTheme from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import { useMessageStore } from "../../store/messageStore";

const withAlpha = (hex, alpha) => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export default function TabLayout() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const unreadMessages = useMessageStore((state) => state.unreadCount);
  const fetchUnreadMessages = useMessageStore((state) => state.fetchUnreadCount);

  useEffect(() => {
    fetchUnreadCount(token);
    fetchUnreadMessages(token);
  }, [fetchUnreadCount, fetchUnreadMessages, token]);

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
      }}
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
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
        name="notifications"
        options={{
          title: "Notifications",
          tabBarLabel: "Alerts",
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarBadge: unreadMessages > 0 ? unreadMessages : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
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

function LiquidGlassTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const [barWidth, setBarWidth] = useState(0);
  const activeIndex = useSharedValue(state.index);
  const morphScale = useSharedValue(1);

  const horizontalPadding = 8;
  const itemWidth = barWidth > 0 ? (barWidth - horizontalPadding * 2) / state.routes.length : 0;
  const glassBackground = withAlpha(colors.cardBackground, isDarkMode ? 0.5 : 0.66);
  const glassBorder = withAlpha(colors.white, isDarkMode ? 0.18 : 0.64);
  const activeGlass = withAlpha(colors.white, isDarkMode ? 0.12 : 0.42);
  const activeGlow = withAlpha(colors.primary, isDarkMode ? 0.18 : 0.12);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, {
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    });
    morphScale.value = withSequence(
      withTiming(1.14, { duration: 110 }),
      withSpring(1, { damping: 14, stiffness: 180 })
    );
  }, [activeIndex, morphScale, state.index]);

  const activeLensStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: activeIndex.value * itemWidth },
      { scaleX: morphScale.value },
      { scaleY: 2 - morphScale.value },
    ],
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.tabBarDock,
        {
          bottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View
        style={[
          styles.tabBarShell,
          {
            borderColor: glassBorder,
            shadowColor: colors.black,
            shadowOpacity: isDarkMode ? 0.36 : 0.16,
          },
        ]}
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      >
        <BlurView intensity={72} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: glassBackground }]} />
          <View
            style={[
              styles.glassHighlight,
              { backgroundColor: withAlpha(colors.white, isDarkMode ? 0.08 : 0.38) },
            ]}
          />
        </BlurView>

        {itemWidth > 0 && (
          <Animated.View
            style={[
              styles.activeLens,
              {
                left: horizontalPadding,
                width: itemWidth,
                backgroundColor: activeGlass,
                borderColor: withAlpha(colors.white, isDarkMode ? 0.18 : 0.7),
                shadowColor: colors.primary,
                shadowOpacity: isDarkMode ? 0.24 : 0.18,
              },
              activeLensStyle,
            ]}
          >
            <View style={[styles.activeLensGlow, { backgroundColor: activeGlow }]} />
          </Animated.View>
        )}

        <View style={styles.tabItemsRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const color = isFocused ? colors.primary : colors.textSecondary;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <LiquidTabButton
                key={route.key}
                route={route}
                options={options}
                isFocused={isFocused}
                color={color}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function LiquidTabButton({ route, options, isFocused, color, onPress, onLongPress }) {
  const iconProgress = useSharedValue(isFocused ? 1 : 0);

  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
        ? options.title
        : route.name;

  useEffect(() => {
    iconProgress.value = withSpring(isFocused ? 1 : 0, {
      damping: 16,
      stiffness: 180,
      mass: 0.7,
    });
  }, [iconProgress, isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -2 * iconProgress.value },
      { scale: 1 + iconProgress.value * 0.1 },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + iconProgress.value * 0.28,
    transform: [{ translateY: -iconProgress.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
    >
      <Animated.View style={iconStyle}>
        {options.tabBarIcon?.({ focused: isFocused, color, size: 23 })}
        {Number(options.tabBarBadge) > 0 && (
          <View style={styles.tabBadge}>
            <Animated.Text style={styles.tabBadgeText}>
              {Number(options.tabBarBadge) > 99 ? "99+" : options.tabBarBadge}
            </Animated.Text>
          </View>
        )}
      </Animated.View>
      <Animated.Text style={[styles.tabBarLabel, { color }, labelStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
