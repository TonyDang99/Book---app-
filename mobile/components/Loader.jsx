import { View, ActivityIndicator } from "react-native";
import useTheme from "../hooks/useTheme";

export default function Loader({ size = "large" }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
}
