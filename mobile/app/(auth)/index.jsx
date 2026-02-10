import React, { useState } from "react";
import { View, Text, Image, TextInput } from "react-native";
import styles from "../../assets/styles/login.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {};
  return (
    <View style={styles.container}>
      <View style={styles.topIllustration}>
        <Image
        source={require("../../assets/images/i.png")}
        style={styles.illustrationImage}
        resizeMode="contain" 
        />
      </View>

      <View style = {styles.card}>
        <View style = {styles.formContainer}>

           <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.placeholderText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

        </View>
        </View>
    </View>
  );
}