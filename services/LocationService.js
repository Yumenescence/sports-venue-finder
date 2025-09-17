import * as Location from "expo-location";
import { Platform } from "react-native";
import Config from "../config";

const EARTH_RADIUS_KM = 6371;

class LocationService {
  constructor() {
    this.lastLocation = null;
  }

  async requestPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        const err = new Error("Location permission not granted");
        err.code = "PERMISSION_DENIED";
        throw err;
      }

      return true;
    } catch (error) {
      if (!error.code) {
        error.code = "PERMISSION_ERROR";
      }
      throw error;
    }
  }

  async getCurrentLocation() {
    try {
      await this.requestPermission();

      let coordinates;

      if (Platform.OS === "web") {
        throw new Error(
          "This application is mobile-only. Web platform is not supported."
        );
      } else {
        const location = await Location.getCurrentPositionAsync(
          Config.LOCATION_OPTIONS
        );

        coordinates = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
      }

      return coordinates;
    } catch (error) {
      throw error;
    }
  }

  async getAddressFromCoordinates(lat, lng) {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (result && result.length > 0) {
        const address = result[0];
        return this.formatAddress(address);
      }

      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error("LocationService.getAddressFromCoordinates failed:", error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  formatAddress(address) {
    const parts = [];

    if (address.streetNumber) parts.push(address.streetNumber);
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);

    return parts.join(", ");
  }

  calculateDistance(point1, point2) {
    const deltaLatRad = this.deg2rad(point2.lat - point1.lat);
    const deltaLngRad = this.deg2rad(point2.lng - point1.lng);

    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(this.deg2rad(point1.lat)) *
        Math.cos(this.deg2rad(point2.lat)) *
        Math.sin(deltaLngRad / 2) *
        Math.sin(deltaLngRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  deg2rad(degrees) {
    return degrees * (Math.PI / 180);
  }

  async isLocationEnabled() {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      return enabled;
    } catch (error) {
      console.error("LocationService.isLocationEnabled failed:", error);
      return false;
    }
  }

  clearLocationCache() {}
}

export default new LocationService();
