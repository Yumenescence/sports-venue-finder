import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSnackbar } from "../SnackbarProvider";
import { styles } from "./styles";

const LocationButton = ({
  onPress,
  loading = false,
  disabled = false,
  isActive = false,
}) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const { showError } = useSnackbar();
  useEffect(() => {
    checkLocationStatus();
  }, []);

  const checkLocationStatus = useCallback(async () => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      const { status } = await Location.getForegroundPermissionsAsync();
      const permitted = status === "granted";
      setLocationEnabled(enabled);
      setHasPermission(permitted);
      return { enabled, permitted };
    } catch (error) {
      console.log("Location check failed:", error);
      setHasPermission(false);
      setLocationEnabled(false);
      return { enabled: false, permitted: false };
    }
  }, []);

  const handlePress = useCallback(async () => {
    const { enabled, permitted } = await checkLocationStatus();
    if (!enabled) {
      showError("Location services are disabled");
      return;
    }
    if (!permitted) {
      showError("Please grant location permission to continue");
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      setHasPermission(granted);
      if (granted) {
        onPress && onPress();
      }
      return;
    }
    onPress && onPress();
  }, [checkLocationStatus, onPress, showError]);

  const getButtonStyle = useCallback(() => {
    if (loading) return [styles.button, styles.buttonLoading];
    if (disabled || !locationEnabled)
      return [styles.button, styles.buttonDisabled];
    if (hasPermission === false)
      return [styles.button, styles.buttonNeedsPermission];
    if (isActive) return [styles.button, styles.buttonLocationActive];
    return [styles.button, styles.buttonActive];
  }, [loading, disabled, locationEnabled, hasPermission, isActive]);

  const getIcon = useCallback(() => {
    if (loading) return null;
    if (!locationEnabled || hasPermission === false) {
      return <MaterialIcons name="location-off" size={20} color="#fff" />;
    }
    if (isActive) {
      return <MaterialIcons name="my-location" size={20} color="#fff" />;
    }
    return <Ionicons name="location" size={20} color="#fff" />;
  }, [loading, locationEnabled, hasPermission, isActive]);

  const getText = useCallback(() => {
    if (loading) return "Getting location...";
    if (!locationEnabled) return "Location disabled";
    if (hasPermission === false) return "Permission needed";
    if (isActive) return "Location active • Tap to disable";
    return "Use my location";
  }, [loading, locationEnabled, hasPermission, isActive]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePress}
        disabled={loading || disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={getText()}
        accessibilityState={{
          disabled: loading || disabled,
          selected: isActive,
        }}
        testID="location-button"
      >
        <View style={styles.buttonContent}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" style={styles.icon} />
          ) : (
            <View style={styles.icon}>{getIcon()}</View>
          )}
          <Text style={isActive ? styles.buttonTextActive : styles.buttonText}>
            {getText()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LocationButton;
