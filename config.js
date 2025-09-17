// TODO: move to env vars later
const Config = {
  GOOGLE_PLACES_API_KEY: "AIzaSyBdtUQkAWRVzgyyjNHmERUrHpqUS6EzuLA",

  SEARCH_RADIUS: 5000,
  MAX_RESULTS: 20,

  VENUE_TYPES: {
    GYM: "gym",
    STADIUM: "stadium",
    GOLF_COURSE: "golf_course",
    SWIMMING_POOL: "swimming_pool",
  },

  LOCATION_OPTIONS: {
    accuracy: 6,
    timeout: 10000,
    maximumAge: 1000,
  },

  API: {
    TIMEOUT_MS: 12000,
    MAX_CONCURRENCY: 4,
    MIN_INTERVAL_MS: 120,
  },

  COLORS: {
    PRIMARY: "#6A4C93",
    SECONDARY: "#A663CC",

    PURPLE: {
      DARK: "#4A148C",
      MAIN: "#6A4C93",
      LIGHT: "#B794F6",
      ACCENT: "#8B5CF6",
      GRADIENT:
        "linear-gradient(135deg, #6A4C93 0%, #A663CC 50%, #B794F6 100%)",
    },

    SPORT: {
      WHITE: "#FFFFFF",
      LIGHT: "#F7FAFC",
      GRAY: "#E2E8F0",
      DARK: "#2D3748",
      GRADIENT: "linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%)",
    },

    GRADIENTS: {
      PRIMARY: "linear-gradient(135deg, #6A4C93 0%, #A663CC 100%)",
      SECONDARY: "linear-gradient(45deg, #8B5CF6 0%, #B794F6 100%)",
      CARD: "linear-gradient(145deg, #FFFFFF 0%, #F7FAFC 100%)",
      BUTTON: "linear-gradient(135deg, #6A4C93 0%, #8B5CF6 50%, #A663CC 100%)",
    },

    SUCCESS: "#48BB78",
    ERROR: "#F56565",
    WARNING: "#ED8936",
    INFO: "#4299E1",

    NEUTRAL: {
      WHITE: "#FFFFFF",
      LIGHT: "#F1F5F9",
      LIGHT_GRAY: "#F7FAFC",
      GRAY: "#A0AEC0",
      DARK_GRAY: "#4A5568",
      BLACK: "#2D3748",
    },

    OVERLAY: "rgba(106, 76, 147, 0.1)",
    SHADOW: "rgba(106, 76, 147, 0.15)",
  },
};

export default Config;
