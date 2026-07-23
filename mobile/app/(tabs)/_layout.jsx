import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Pressable, View } from "react-native";
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
import {
  tabsStyles as styles,
  getActiveLensAnimatedStyle,
  getActiveLensGlowStyle,
  getActiveLensStyle,
  getGlassBackgroundStyle,
  getGlassHighlightStyle,
  getIconAnimatedStyle,
  getLabelAnimatedStyle,
  getTabBarDockStyle,
  getTabBarShellStyle,
  getTabLabelColorStyle,
  getTabScreenOptions,
  withAlpha,
} from "../../assets/styles/shared.styles";

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
      screenOptions={getTabScreenOptions(colors)}
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

  const activeLensStyle = useAnimatedStyle(() =>
    getActiveLensAnimatedStyle(activeIndex, morphScale, itemWidth)
  );

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.tabBarDock,
        getTabBarDockStyle(insets.bottom),
      ]}
    >
      <View
        style={[
          styles.tabBarShell,
          getTabBarShellStyle(colors, glassBorder, isDarkMode),
        ]}
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      >
        <BlurView intensity={72} tint={isDarkMode ? "dark" : "light"} style={styles.absoluteFill}>
          <View style={[styles.absoluteFill, getGlassBackgroundStyle(glassBackground)]} />
          <View
            style={[
              styles.glassHighlight,
              getGlassHighlightStyle(colors, isDarkMode),
            ]}
          />
        </BlurView>

        {itemWidth > 0 && (
          <Animated.View
            style={[
              styles.activeLens,
              getActiveLensStyle(
                horizontalPadding,
                itemWidth,
                activeGlass,
                colors,
                isDarkMode
              ),
              activeLensStyle,
            ]}
          >
            <View style={[styles.activeLensGlow, getActiveLensGlowStyle(activeGlow)]} />
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

  const iconStyle = useAnimatedStyle(() => getIconAnimatedStyle(iconProgress));

  const labelStyle = useAnimatedStyle(() => getLabelAnimatedStyle(iconProgress));

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
      <Animated.Text
        style={[styles.tabBarLabel, getTabLabelColorStyle(color), labelStyle]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}
