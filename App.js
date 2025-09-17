import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./App.styles";
import SnackbarProvider from "./components/common/SnackbarProvider";
import HomeScreen from "./components/screens/HomeScreen";
import Config from "./config";

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
        <SafeAreaProvider>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: Config.COLORS.PRIMARY }}
          >
            <StatusBar style="light" backgroundColor={Config.COLORS.PRIMARY} />
            <HomeScreen />
          </SafeAreaView>
        </SafeAreaProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
