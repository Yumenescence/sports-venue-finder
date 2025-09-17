import React, { useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles";

const VenueFilters = ({
  filters = [],
  selectedFilters = [],
  onFiltersChange,
  multiSelect = true,
}) => {
  const [animations] = useState(
    filters.reduce((acc, filter) => {
      acc[filter.id] = new Animated.Value(0);
      return acc;
    }, {})
  );

  const handleFilterPress = (filterId) => {
    let newSelectedFilters;

    if (multiSelect) {
      if (selectedFilters.includes(filterId)) {
        newSelectedFilters = selectedFilters.filter((id) => id !== filterId);
      } else {
        newSelectedFilters = [...selectedFilters, filterId];
      }
    } else {
      newSelectedFilters = selectedFilters.includes(filterId) ? [] : [filterId];
    }

    const animation = animations[filterId];
    if (animation) {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onFiltersChange && onFiltersChange(newSelectedFilters);
  };

  const handleClearAll = () => {
    const animationPromises = Object.values(animations).map(
      (animation) =>
        new Promise((resolve) => {
          Animated.timing(animation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start(resolve);
        })
    );

    Promise.all(animationPromises).then(() => {
      Object.values(animations).forEach((animation) => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start();
      });
    });

    onFiltersChange && onFiltersChange([]);
  };

  const renderFilterChip = (filter) => {
    const isSelected = selectedFilters.includes(filter.id);
    const IconComponent = filter.iconFamily;
    const animation = animations[filter.id];

    const animatedScale = animation
      ? animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.95],
        })
      : 1;

    return (
      <Animated.View
        key={filter.id}
        style={[
          styles.chipContainer,
          { transform: [{ scale: animatedScale }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.chip,
            isSelected && styles.chipSelected,
            { backgroundColor: isSelected ? filter.color : "#fff" },
          ]}
          onPress={() => handleFilterPress(filter.id)}
          activeOpacity={0.8}
        >
          <View style={styles.chipIcon}>
            <IconComponent
              name={filter.icon}
              size={18}
              color={isSelected ? "#fff" : filter.color}
            />
          </View>

          <Text
            style={[
              styles.chipText,
              { color: isSelected ? "#fff" : "#495057" },
            ]}
          >
            {filter.name}
          </Text>

          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedIndicatorText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Filters</Text>
        {selectedFilters.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {filters.map(renderFilterChip)}
      </ScrollView>
    </View>
  );
};

export default VenueFilters;
