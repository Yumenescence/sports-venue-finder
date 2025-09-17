import { StyleSheet } from "react-native";
import Config from "../../../config";

export const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#6A4C93",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonActive: {
    backgroundColor: Config.COLORS.PRIMARY,
  },
  buttonLocationActive: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  buttonLoading: {
    backgroundColor: Config.COLORS.NEUTRAL.GRAY,
  },
  buttonDisabled: {
    backgroundColor: Config.COLORS.NEUTRAL.LIGHT_GRAY,
  },
  buttonNeedsPermission: {
    backgroundColor: Config.COLORS.SECONDARY,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
    width: 20,
    alignItems: "center",
  },
  buttonText: {
    color: Config.COLORS.NEUTRAL.WHITE,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  buttonTextActive: {
    color: Config.COLORS.NEUTRAL.WHITE,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
