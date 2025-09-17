import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";
import Config from "../../../config";
import { styles } from "./styles";

const SnackbarContext = createContext({
  show: (_message, _options) => {},
  showError: (_message) => {},
  showSuccess: (_message) => {},
  showInfo: (_message) => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

const DEFAULT_DURATION_MS = 3000;

export const SnackbarProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const hideTimeoutRef = useRef(null);
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const clearTimer = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (onEnd) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 80,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onEnd && onEnd();
    });
  };

  const hide = useCallback(() => {
    clearTimer();
    animateOut(() => setVisible(false));
  }, []);

  const show = useCallback(
    (text, options = {}) => {
      const { duration = DEFAULT_DURATION_MS, variant = "info" } = options;

      clearTimer();
      setMessage(typeof text === "string" ? text : String(text));
      setType(variant);
      setVisible(true);
      translateY.setValue(80);
      opacity.setValue(0);
      animateIn();

      hideTimeoutRef.current = setTimeout(() => hide(), duration);
    },
    [hide, opacity, translateY]
  );

  const showError = useCallback(
    (text) => show(text, { variant: "error" }),
    [show]
  );
  const showSuccess = useCallback(
    (text) => show(text, { variant: "success" }),
    [show]
  );
  const showInfo = useCallback(
    (text) => show(text, { variant: "info" }),
    [show]
  );

  useEffect(() => () => clearTimer(), []);

  const value = useMemo(
    () => ({ show, showError, showSuccess, showInfo }),
    [show, showError, showSuccess, showInfo]
  );

  const getBackgroundByType = () => {
    switch (type) {
      case "error":
        return Config.COLORS.ERROR;
      case "success":
        return Config.COLORS.SUCCESS;
      case "info":
      default:
        return Config.COLORS.INFO;
    }
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {visible && (
        <View pointerEvents="box-none" style={styles.host}>
          <Animated.View
            style={[
              styles.snackbar,
              {
                backgroundColor: getBackgroundByType(),
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity onPress={hide} activeOpacity={0.8}>
              <Text style={styles.action}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;
