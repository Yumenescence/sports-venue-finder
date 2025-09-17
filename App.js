import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, Text, View } from "react-native";
import { styles } from "./App.styles";
import SnackbarProvider from "./components/common/SnackbarProvider";
import HomeScreen from "./components/screens/HomeScreen";

const queryClient = new QueryClient();

export default function App() {
  if (Platform.OS === "web") {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.title}>Mobile only</Text>
        <Text style={styles.subtitle}>
          This application is designed for iOS and Android. Please run it on a
          mobile device or simulator.
        </Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <StatusBar style="dark" backgroundColor="#fff" />
        <HomeScreen />
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
