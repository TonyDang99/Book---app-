import { View, Text, Platform, KeyboardAvoidingView } from 'react-native';
import styles from "../../assets/styles/signup.styles";

export default function Signup() {
  return (
     <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.container}>
            <View style={styles.card}>
              {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>BookWorm🐛</Text>
            <Text style={styles.subtitle}>Share your favorite reads</Text>
          </View>
              </View> 
              </View>
    </KeyboardAvoidingView>
  );
}