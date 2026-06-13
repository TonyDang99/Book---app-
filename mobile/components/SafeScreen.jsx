import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTheme from "../hooks/useTheme";


export default function SafeScreen({children}) {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

  return (
    <View style={[styles.container, {paddingTop: insets.top, backgroundColor: colors.background}]}>
      {children}
    </View>
  );
}
  const styles = StyleSheet.create({

    container: {
      flex: 1,
    },
});
