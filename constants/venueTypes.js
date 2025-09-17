import { MaterialIcons } from "@expo/vector-icons";

export const VENUE_TYPES_ENUM = {
  GYM: "gym",
  STADIUM: "stadium",
  GOLF_COURSE: "golf_course",
  SWIMMING_POOL: "swimming_pool",
};

export const VENUE_TYPES = {
  GYM: {
    id: VENUE_TYPES_ENUM.GYM,
    name: "Gyms",
    googleType: VENUE_TYPES_ENUM.GYM,
    icon: "fitness-center",
    iconFamily: MaterialIcons,
    color: "#6A4C93",
    gradientColors: ["#6A4C93", "#8B5CF6"],
    searchKeywords: ["gym", "fitness", "workout"],
  },
  STADIUM: {
    id: VENUE_TYPES_ENUM.STADIUM,
    name: "Stadiums",
    googleType: VENUE_TYPES_ENUM.STADIUM,
    icon: "sports-football",
    iconFamily: MaterialIcons,
    color: "#A663CC",
    gradientColors: ["#A663CC", "#B794F6"],
    searchKeywords: ["stadium", "sports complex"],
  },
  GOLF_COURSE: {
    id: VENUE_TYPES_ENUM.GOLF_COURSE,
    name: "Golf Courses",
    googleType: VENUE_TYPES_ENUM.GOLF_COURSE,
    icon: "golf-course",
    iconFamily: MaterialIcons,
    color: "#8B5CF6",
    gradientColors: ["#8B5CF6", "#A663CC"],
    searchKeywords: ["golf", "golf course"],
  },
  SWIMMING_POOL: {
    id: VENUE_TYPES_ENUM.SWIMMING_POOL,
    name: "Swimming Pools",
    googleType: VENUE_TYPES_ENUM.SWIMMING_POOL,
    icon: "pool",
    iconFamily: MaterialIcons,
    color: "#B794F6",
    gradientColors: ["#B794F6", "#A663CC"],
    searchKeywords: ["swimming pool", "pool"],
  },
};

export const getVenueTypeConfig = (typeId) => {
  return VENUE_TYPES[typeId?.toUpperCase?.()] || null;
};

export const getVenueConfigByGoogleTypes = (googleTypes) => {
  if (!googleTypes || !Array.isArray(googleTypes)) {
    return getDefaultVenueConfig();
  }

  for (const venueType of Object.values(VENUE_TYPES)) {
    if (googleTypes.includes(venueType.googleType)) {
      return venueType;
    }
  }

  const typeString = googleTypes.join(" ").toLowerCase();
  for (const venueType of Object.values(VENUE_TYPES)) {
    if (
      venueType.searchKeywords.some((keyword) =>
        typeString.includes(keyword.toLowerCase())
      )
    ) {
      return venueType;
    }
  }

  return getDefaultVenueConfig();
};

export const getDefaultVenueConfig = () => ({
  id: "default",
  name: "Sports Venue",
  googleType: "establishment",
  icon: "place",
  iconFamily: MaterialIcons,
  color: "#A0AEC0",
  gradientColors: ["#A0AEC0", "#B794F6"],
});

export const getFilterableVenueTypes = () => Object.values(VENUE_TYPES);
