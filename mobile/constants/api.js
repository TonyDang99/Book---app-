import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = process.env.EXPO_PUBLIC_API_PORT || "3000";

const getExpoHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  return hostUri
    ?.replace(/^.*:\/\//, "")
    .split("/")[0]
    .split(":")[0];
};

const getLocalHost = () => (Platform.OS === "android" ? "10.0.2.2" : "localhost");

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  const expoHost = getExpoHost();
  const host =
    expoHost === "localhost" && Platform.OS === "android"
      ? getLocalHost()
      : expoHost || getLocalHost();

  return `http://${host}:${API_PORT}/api`;
};

export const API_URL = getApiUrl();
