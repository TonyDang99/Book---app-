import { useThemeStore } from "../store/themeStore";

export default function useTheme() {
  const colors = useThemeStore((state) => state.colors);
  const mode = useThemeStore((state) => state.mode);

  return {
    colors,
    isDarkMode: mode === "dark",
    mode,
  };
}
