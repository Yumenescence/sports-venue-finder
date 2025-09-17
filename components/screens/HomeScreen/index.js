import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StatusBar,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import Config from "../../../config";
import { getFilterableVenueTypes } from "../../../constants/venueTypes";
import useVenues from "../../../hooks/useVenues";
import LocationService from "../../../services/LocationService";
import { filterVenuesByType } from "../../../utils/venues";

import SearchBar from "../../common/SearchBar";
import { useSnackbar } from "../../common/SnackbarProvider";
import VenuesList from "../../common/VenuesList";
import VenueFilters from "../../filters/VenueFilters";
import { styles } from "./styles";

const HomeScreen = () => {
  const [venues, setVenues] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationActive, setIsLocationActive] = useState(false);
  const [availableFilters] = useState(getFilterableVenueTypes());

  const { showError } = useSnackbar();

  const effectiveTypes = useMemo(
    () =>
      selectedFilters.length > 0
        ? selectedFilters.map((t) => t.googleType || t)
        : [],
    [selectedFilters]
  );

  const venuesQuery = useVenues({
    query: committedQuery,
    center: isLocationActive ? userLocation : null,
    types: effectiveTypes,
    enabled:
      !!committedQuery || !!isLocationActive || effectiveTypes.length > 0,
  });

  useEffect(() => {
    const pages = venuesQuery.data?.pages || [];
    const merged = pages.flatMap((p) => p.results || []);
    setVenues(merged);
    setLoading(venuesQuery.isFetching && !venuesQuery.isFetchingNextPage);
  }, [
    venuesQuery.data,
    venuesQuery.isFetching,
    venuesQuery.isFetchingNextPage,
  ]);

  useEffect(() => {
    const sportsIds = availableFilters.map((f) => f.id);
    const effectiveIds =
      selectedFilters.length > 0 ? selectedFilters : sportsIds;
    const result = filterVenuesByType(venues, effectiveIds);
    setFiltered(result);
  }, [venues, selectedFilters]);

  const doSearch = async (searchText) => {
    const next = (searchText || "").trim();
    if (!next) {
      setCommittedQuery("");
      setVenues([]);
      setIsLocationActive(false);
      setLoading(false);
      return;
    }
    setCommittedQuery(next);
  };

  const onFiltersChange = async (newFilters) => {
    setSelectedFilters(newFilters);
  };

  const loadMoreResults = () => {
    if (venuesQuery.hasNextPage && !venuesQuery.isFetchingNextPage) {
      venuesQuery.fetchNextPage();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Config.COLORS.PRIMARY}
        />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sports Finder</Text>
          <Text style={styles.headerSubtitle}>
            Find training facilities near you
          </Text>
        </View>

        <View style={styles.searchSection}>
          <SearchBar
            value={query}
            onSearch={doSearch}
            placeholder="Search locations..."
            loading={loading}
            isLocationActive={isLocationActive}
            onManualInput={(text) => {
              if (isLocationActive) {
                setIsLocationActive(false);
              }
              if (typeof text === "string") {
                setQuery(text);
                setCommittedQuery("");
              }
            }}
            onLocationPress={async () => {
              if (isLocationActive) {
                setIsLocationActive(false);
                return;
              }
              try {
                const loc = await LocationService.getCurrentLocation();
                setUserLocation(loc);
                setIsLocationActive(true);
                try {
                  const address =
                    await LocationService.getAddressFromCoordinates(
                      loc.lat,
                      loc.lng
                    );
                  setQuery(`📍 ${address}`);
                } catch (e) {
                  setQuery("📍 Current location");
                }
              } catch (e) {
                if (e?.code === "PERMISSION_DENIED") {
                  showError("Location permission not granted");
                } else if (e?.code === "UNSUPPORTED_PLATFORM") {
                  showError("Location is unavailable on this platform");
                } else {
                  showError("Failed to get location");
                }
              }
            }}
          />
        </View>

        <VenueFilters
          filters={availableFilters}
          selectedFilters={selectedFilters}
          onFiltersChange={onFiltersChange}
        />

        <View style={styles.resultsSection}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Config.COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {!loading &&
            filtered.length === 0 &&
            (committedQuery || isLocationActive) && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No venues found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search or filters
                </Text>
              </View>
            )}

          {!loading &&
            filtered.length === 0 &&
            !committedQuery &&
            !isLocationActive && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Ready to search</Text>
                <Text style={styles.emptySubtext}>
                  Enter a location or use GPS to find nearby sports venues
                </Text>
              </View>
            )}

          {!loading && filtered.length > 0 && (
            <VenuesList
              venues={filtered}
              currentLocation={userLocation}
              onLoadMore={loadMoreResults}
              hasMoreResults={!!venuesQuery.hasNextPage}
              loadingMore={!!venuesQuery.isFetchingNextPage}
            />
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HomeScreen;
