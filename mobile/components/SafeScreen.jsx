import { useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTheme from "../hooks/useTheme";
import { createSafeScreenStyles as createStyles } from "../assets/styles/shared.styles";

export default function SafeScreen({ children }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, insets.top), [colors, insets.top]);

  return <View style={styles.container}>{children}</View>;
}
