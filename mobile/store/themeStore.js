import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { THEME_COLORS } from "../constants/theme";

const THEME_STORAGE_KEY = "bookworm-theme-mode";

const getThemeState = (mode) => ({
  mode,
  colors: THEME_COLORS[mode],
});

export const useThemeStore = create((set, get) => ({
  ...getThemeState("light"),

  hydrateTheme: async () => {
    try {
      const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const mode = storedMode === "dark" ? "dark" : "light";

      set(getThemeState(mode));
    } catch (error) {
      console.log("Theme hydrate failed", error);
    }
  },

  toggleTheme: async () => {
    const nextMode = get().mode === "dark" ? "light" : "dark";

    set(getThemeState(nextMode));

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (error) {
      console.log("Theme save failed", error);
    }
  },
}));
