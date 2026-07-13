import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useEffect } from "react";
import usePushNotifications from "../hooks/usePushNotifications";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth, user, token, isCheckingAuth } = useAuthStore();
  const mode = useThemeStore((state) => state.mode);
  const hydrateTheme = useThemeStore((state) => state.hydrateTheme);

  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  usePushNotifications();

  useEffect(() => {
    if (fontsLoaded && !isCheckingAuth) SplashScreen.hideAsync();
  }, [fontsLoaded, isCheckingAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  // handle navigation based on the auth state
  useEffect(() => {
    if (isCheckingAuth) return;

    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen) router.replace("/(auth)");
    else if (isSignedIn && inAuthScreen) router.replace("/(tabs)");
  }, [isCheckingAuth, user, token, segments, router]);

  if (!fontsLoaded || isCheckingAuth) return null;

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="book" />
          <Stack.Screen name="user" />
          <Stack.Screen name="connections" />
          <Stack.Screen name="chat" />
        </Stack>
      </SafeScreen>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
    </SafeAreaProvider>
  );
}
