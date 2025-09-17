import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Config from "../../../config";
import PlacesService from "../../../services/PlacesService";
import { styles } from "./styles";

const AUTOCOMPLETE_DEBOUNCE_MS = 400;
const SEARCH_MIN_CHARS = 2;
const FOCUS_ANIM_DURATION_MS = 200;
const PIN_PREFIX_REGEX = /^📍\s*/;

const SearchBar = ({
  value,
  onSearch,
  placeholder = "Search...",
  loading = false,
  autoFocus = false,
  isLocationActive = false,
  onLocationPress,
  onManualInput,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const focusAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [fetchingPredictions, setFetchingPredictions] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value || "");
    }
  }, [value, isFocused]);

  const debouncedFetchPredictions = useRef(
    debounce(async (text) => {
      if (!text || text.length < SEARCH_MIN_CHARS) {
        setPredictions([]);
        return;
      }
      try {
        setFetchingPredictions(true);
        const items = await PlacesService.autocomplete(text);
        setPredictions(items);
      } catch (e) {
        setPredictions([]);
      } finally {
        setFetchingPredictions(false);
      }
    }, AUTOCOMPLETE_DEBOUNCE_MS)
  ).current;

  useEffect(() => {
    return () => {
      debouncedFetchPredictions.cancel?.();
    };
  }, [debouncedFetchPredictions]);

  const animateToFocused = useCallback(
    (focused) => {
      Animated.timing(focusAnimation, {
        toValue: focused ? 1 : 0,
        duration: FOCUS_ANIM_DURATION_MS,
        useNativeDriver: false,
      }).start();
    },
    [focusAnimation]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    animateToFocused(true);
    const withoutPin = inputValue.replace(PIN_PREFIX_REGEX, "");
    if (withoutPin !== inputValue) {
      setInputValue(withoutPin);
    }
  }, [animateToFocused, inputValue]);

  const handleBlur = useCallback(() => {
    if (inputValue.trim() === "" && onSearch) {
      onSearch("");
    }
    setIsFocused(false);
    animateToFocused(false);
  }, [animateToFocused, inputValue, onSearch]);

  const handleChangeText = useCallback(
    (text) => {
      const cleaned = text.replace(PIN_PREFIX_REGEX, "");
      setInputValue(cleaned);
      debouncedFetchPredictions(cleaned);
      if (onManualInput && typeof cleaned === "string") {
        onManualInput(cleaned);
      }
    },
    [debouncedFetchPredictions, onManualInput]
  );

  const handleSearch = useCallback(() => {
    if (inputValue.trim() && onSearch) {
      onSearch(inputValue.trim());
      inputRef.current?.blur();
    }
  }, [inputValue, onSearch]);

  const handleClear = useCallback(() => {
    setInputValue("");
    if (onSearch) {
      onSearch("");
    }
    inputRef.current?.focus();
  }, [onSearch]);

  const handleContainerPress = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const borderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Config.COLORS.SPORT.GRAY, Config.COLORS.PRIMARY],
  });

  const searchIconScale = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const backgroundColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Config.COLORS.SPORT.WHITE, Config.COLORS.SPORT.LIGHT],
  });

  return (
    <View>
      <TouchableOpacity
        onPress={handleContainerPress}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Focus search input"
        testID="searchbar-container"
      >
        <Animated.View
          style={[styles.container, { borderColor, backgroundColor }]}
          testID="searchbar-animated-container"
        >
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: searchIconScale }] },
            ]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Ionicons
              name="search"
              size={20}
              color={
                isFocused ? Config.COLORS.PRIMARY : Config.COLORS.NEUTRAL.GRAY
              }
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </Animated.View>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputValue}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSearch}
            placeholder={placeholder}
            placeholderTextColor={Config.COLORS.NEUTRAL.GRAY}
            autoFocus={autoFocus}
            returnKeyType="search"
            editable={!loading}
            autoCorrect={false}
            autoCapitalize="words"
            accessibilityLabel="Search input"
            accessibilityHint="Type a location or venue to search"
            testID="searchbar-input"
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Config.COLORS.PRIMARY} />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.searchButton,
              isLocationActive
                ? styles.locationActiveButton
                : styles.locationIdleButton,
            ]}
            onPress={onLocationPress}
            activeOpacity={0.8}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={
              isLocationActive
                ? "Use current location active"
                : "Use current location"
            }
            accessibilityState={{
              disabled: loading,
              selected: isLocationActive,
            }}
            testID="searchbar-location-button"
          >
            <MaterialIcons
              name={isLocationActive ? "my-location" : "location-searching"}
              size={18}
              color={
                isLocationActive
                  ? Config.COLORS.NEUTRAL.WHITE
                  : Config.COLORS.NEUTRAL.GRAY
              }
            />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      {inputValue.trim().length > 0 && !loading && (
        <TouchableOpacity
          style={styles.bottomSearchButton}
          onPress={handleSearch}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Search"
          testID="searchbar-submit"
        >
          <Text style={styles.bottomSearchText}>Search</Text>
        </TouchableOpacity>
      )}

      {isFocused && predictions.length > 0 && (
        <View style={styles.autocompleteContainer}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            testID="searchbar-autocomplete-list"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setPredictions([]);
                  setInputValue(item.description);
                  onManualInput && onManualInput(item.description);
                  onSearch && onSearch(item.description);
                  inputRef.current?.blur();
                }}
                style={styles.autocompleteItem}
                accessibilityRole="button"
                accessibilityLabel={`Use suggestion ${item.description}`}
                testID={`searchbar-suggestion-${item.id}`}
              >
                <Text style={styles.autocompleteText}>{item.description}</Text>
              </Pressable>
            )}
            ListFooterComponent={
              fetchingPredictions ? (
                <View style={styles.predictionsFooter}>
                  <ActivityIndicator
                    size="small"
                    color={Config.COLORS.PRIMARY}
                  />
                </View>
              ) : null
            }
          />
        </View>
      )}
    </View>
  );
};

export default SearchBar;
