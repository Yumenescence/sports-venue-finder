import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Config from "../../../config";
import LocationService from "../../../services/LocationService";
import VenueCard from "../VenueCard";
import { styles } from "./styles";

const VenuesList = ({
  venues = [],
  currentLocation = null,
  onRefresh = null,
  loading = false,
  sortBy = "distance",
  onVenuePress = null,
  onLoadMore = null,
  hasMoreResults = false,
  loadingMore = false,
  centerIsGps = true,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentSort, setCurrentSort] = useState(sortBy);
  const onEndReachedCalledDuringMomentum = useRef(false);
  const EST_ITEM_HEIGHT = 148;

  const distanceMap = useMemo(() => {
    if (!currentLocation || !venues.length) return null;
    const map = new Map();
    for (const v of venues) {
      try {
        map.set(
          v.id,
          LocationService.calculateDistance(currentLocation, v.location)
        );
      } catch {}
    }
    return map;
  }, [venues, currentLocation]);

  const sortedVenues = useMemo(() => {
    if (!venues.length) return [];

    const venuesCopy = [...venues];

    switch (currentSort) {
      case "distance":
        if (currentLocation && distanceMap) {
          return venuesCopy.sort((a, b) => {
            const distanceA = distanceMap.get(a.id) ?? Number.POSITIVE_INFINITY;
            const distanceB = distanceMap.get(b.id) ?? Number.POSITIVE_INFINITY;
            return distanceA - distanceB;
          });
        }
        return venuesCopy;

      case "rating":
        return venuesCopy.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA; 
        });

      case "name":
        return venuesCopy.sort((a, b) => a.name.localeCompare(b.name));

      default:
        return venuesCopy;
    }
  }, [venues, currentLocation, currentSort, distanceMap]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleSortChange = () => {
    const sortOptions = [
      { key: "distance", label: "By distance", enabled: !!currentLocation },
      { key: "rating", label: "By rating", enabled: true },
      { key: "name", label: "By name", enabled: true },
    ];

    const availableOptions = sortOptions.filter((option) => option.enabled);

    const buttons = availableOptions.map((option) => ({
      text: option.label,
      onPress: () => setCurrentSort(option.key),
      style: currentSort === option.key ? "destructive" : "default",
    }));

    buttons.push({ text: "Cancel", style: "cancel" });

    Alert.alert("Sort", "Choose sorting:", buttons);
  };

  const handleVenuePress = (venue) => {
    if (onVenuePress) {
      onVenuePress(venue);
    } else {
      const distance = currentLocation
        ? LocationService.calculateDistance(currentLocation, venue.location)
        : null;

      const distanceText = distance
        ? `\nDistance: ${
            distance < 1
              ? Math.round(distance * 1000) + "m"
              : distance.toFixed(1) + "km"
          }`
        : "";

      Alert.alert(
        venue.name,
        `${venue.address}${distanceText}\n\nType: ${venue.primaryType}${
          venue.rating ? "\nRating: " + venue.rating + "⭐" : ""
        }`,
        [{ text: "OK" }]
      );
    }
  };

  const renderVenueItem = useCallback(
    ({ item }) => (
      <VenueCard
        venue={item}
        currentLocation={currentLocation}
        centerIsGps={centerIsGps}
        onPress={handleVenuePress}
      />
    ),
    [currentLocation, centerIsGps, handleVenuePress]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const getItemLayout = useCallback(
    (_data, index) => ({
      length: EST_ITEM_HEIGHT,
      offset: EST_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const renderListHeader = () => {
    if (!sortedVenues.length) return null;

    const getSortLabel = () => {
      switch (currentSort) {
        case "distance":
          return "by distance";
        case "rating":
          return "by rating";
        case "name":
          return "alphabetical";
        default:
          return "";
      }
    };

    return (
      <View style={styles.headerContainer} testID="venues-list-header">
        <View style={styles.resultsInfo}>
          {!hasMoreResults && (
            <Text
              style={styles.resultsCount}
              testID="venues-list-results-count"
            >
              {sortedVenues.length === 1
                ? `Found 1 place`
                : `Found ${sortedVenues.length} places`}
            </Text>
          )}
          <Text style={styles.sortInfo} testID="venues-list-sort-info">
            Sorted {getSortLabel()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={handleSortChange}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Change sort"
          testID="venues-list-sort-button"
        >
          <MaterialIcons name="sort" size={20} color={Config.COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSeparator = () => <View style={styles.separator} />;

  const renderEmptyList = () => (
    <View style={styles.emptyContainer} testID="venues-list-empty">
      <Ionicons name="location-outline" size={64} color="#adb5bd" />
      <Text style={styles.emptyTitle}>No venues found</Text>
      <Text style={styles.emptyMessage}>Try adjusting search or filters</Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMoreResults) return null;

    return (
      <View style={styles.footerContainer} testID="venues-list-footer">
        <ActivityIndicator size="small" color={Config.COLORS.PRIMARY} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const handleLoadMore = () => {
    if (onLoadMore && hasMoreResults && !loadingMore) {
      onLoadMore();
    }
  };

  const handleEndReached = () => {
    if (onEndReachedCalledDuringMomentum.current) return;
    if (hasMoreResults && !loadingMore && onLoadMore) {
      onEndReachedCalledDuringMomentum.current = true;
      onLoadMore();
    }
  };

  const listKey = `venues-${currentSort}`;

  return (
    <FlatList
      testID="venues-list"
      key={listKey}
      data={sortedVenues}
      renderItem={renderVenueItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListHeaderComponent={renderListHeader}
      ListEmptyComponent={renderEmptyList}
      ListFooterComponent={renderFooter}
      ItemSeparatorComponent={renderSeparator}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.15}
      onMomentumScrollBegin={() => {
        onEndReachedCalledDuringMomentum.current = false;
      }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Config.COLORS.PRIMARY]}
            tintColor={Config.COLORS.PRIMARY}
          />
        ) : undefined
      }
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        !sortedVenues.length && styles.emptyContentContainer,
      ]}
      showsVerticalScrollIndicator={true}
      initialNumToRender={8}
      maxToRenderPerBatch={6}
      updateCellsBatchingPeriod={16}
      windowSize={6}
      scrollEventThrottle={16}
      removeClippedSubviews={true}
    />
  );
};

export default VenuesList;
