import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Config from "../../../config";
import { getVenueConfigByGoogleTypes } from "../../../constants/venueTypes";
import LocationService from "../../../services/LocationService";
import { styles } from "./styles";

const VenueCard = ({ venue, currentLocation, onPress }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const venueConfig = getVenueConfigByGoogleTypes(venue.types);
  const IconComponent = venueConfig.iconFamily;

  const distance =
    currentLocation && venue.location
      ? LocationService.calculateDistance(currentLocation, venue.location)
      : null;

  const formatDistance = (dist) => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m`;
    }
    return `${dist.toFixed(1)}km`;
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handlePress = () => {
    if (onPress) {
      onPress(venue);
    } else {
      Alert.alert(
        venue.name,
        `${venue.address}\n\n${venue.types?.join(", ")}`,
        [{ text: "OK" }]
      );
    }
  };

  const renderImage = () => {
    if (venue.photoUrl && !imageError) {
      return (
        <>
          <Image
            source={{ uri: venue.photoUrl }}
            style={styles.image}
            onError={handleImageError}
            onLoad={handleImageLoad}
            accessibilityLabel={`${venue.name} photo`}
            accessibilityRole="image"
            testID="venue-card-image"
          />
          {imageLoading && (
            <View style={styles.imageLoader}>
              <ActivityIndicator size="small" color={Config.COLORS.PRIMARY} />
            </View>
          )}
        </>
      );
    } else {
      return (
        <View
          style={[
            styles.imagePlaceholder,
            { backgroundColor: venueConfig.color + "20" },
          ]}
          accessibilityLabel="No image available"
          accessibilityRole="image"
          testID="venue-card-image-placeholder"
        >
          <IconComponent
            name={venueConfig.icon}
            size={30}
            color={venueConfig.color}
          />
        </View>
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${venue.name}. ${venue.address}`}
      testID="venue-card"
    >
      <View style={styles.imageContainer}>
        {renderImage()}

        <View
          style={[styles.typeIndicator, { backgroundColor: venueConfig.color }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <IconComponent name={venueConfig.icon} size={16} color="#fff" />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {venue.name}
          </Text>
          {venue.rating && (
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={14} color="#FFA000" />
              <Text style={styles.rating}>{venue.rating}</Text>
            </View>
          )}
        </View>

        <Text style={styles.address} numberOfLines={2}>
          {venue.address}
        </Text>

        <View style={styles.detailsRow}>
          {distance !== null && (
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={14} color="#6c757d" />
              <Text style={styles.distance} testID="venue-card-distance">
                {formatDistance(distance)}
              </Text>
            </View>
          )}

          {venue.isOpen !== undefined && (
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: venue.isOpen ? "#28a745" : "#dc3545" },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: venue.isOpen ? "#28a745" : "#dc3545" },
                ]}
              >
                {venue.isOpen ? "Open" : "Closed"}
              </Text>
            </View>
          )}

          {venue.priceLevel && (
            <View style={styles.priceLevelContainer}>
              {[...Array(4)].map((_, index) => (
                <Text
                  key={index}
                  style={[
                    styles.priceSymbol,
                    index < venue.priceLevel
                      ? { color: "#28a745" }
                      : { color: "#e9ecef" },
                  ]}
                >
                  $
                </Text>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.venueType} numberOfLines={1}>
          {venueConfig.name}
        </Text>
      </View>

      <View style={styles.arrowContainer} testID="venue-card-arrow">
        <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
      </View>
    </TouchableOpacity>
  );
};

export default memo(VenueCard, (prev, next) => {
  const a = prev.venue;
  const b = next.venue;
  if (a?.id !== b?.id) return false;
  if (a?.name !== b?.name) return false;
  if (a?.rating !== b?.rating) return false;
  if (a?.address !== b?.address) return false;
  const distChanged =
    !!prev.currentLocation !== !!next.currentLocation ||
    (prev.currentLocation &&
      next.currentLocation &&
      (prev.currentLocation.lat !== next.currentLocation.lat ||
        prev.currentLocation.lng !== next.currentLocation.lng));
  if (distChanged) return false;
  return true;
});
