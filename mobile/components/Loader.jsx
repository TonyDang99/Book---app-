import { useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import useTheme from "../hooks/useTheme";
import { createLoaderStyles as createStyles } from "../assets/styles/shared.styles";

export default function Loader({ size = "large" }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
}
