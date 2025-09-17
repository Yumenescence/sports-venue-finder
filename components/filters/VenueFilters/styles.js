import { StyleSheet } from "react-native";
import Config from "../../../config";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Config.COLORS.NEUTRAL.WHITE,
    borderBottomWidth: 0,
    paddingTop: 20,
    paddingBottom: 10,
    shadowColor: Config.COLORS.SHADOW,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  headerText: {
    fontSize: 19,
    fontWeight: "600",
    color: Config.COLORS.PURPLE.DARK,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: Config.COLORS.PURPLE.LIGHT,
    borderRadius: 18,
  },
  clearButtonText: {
    fontSize: 14,
    color: Config.COLORS.PURPLE.DARK,
    fontWeight: "500",
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContainer: {
    paddingHorizontal: 15,
    alignItems: "center",
  },
  chipContainer: {
    marginHorizontal: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Config.COLORS.PURPLE.LIGHT,
    minWidth: 115,
    backgroundColor: Config.COLORS.NEUTRAL.WHITE,
    shadowColor: Config.COLORS.SHADOW,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chipSelected: {
    borderColor: "transparent",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  chipIcon: {
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    letterSpacing: 0.2,
  },
  selectedIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: Config.COLORS.SHADOW,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedIndicatorText: {
    color: Config.COLORS.PRIMARY,
    fontSize: 12,
    fontWeight: "bold",
  },
  activeFiltersContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
    backgroundColor: Config.COLORS.PURPLE.LIGHT,
    marginHorizontal: 15,
    borderRadius: 12,
    paddingVertical: 8,
  },
  activeFiltersText: {
    fontSize: 14,
    color: Config.COLORS.PURPLE.DARK,
    textAlign: "center",
    fontWeight: "500",
  },
});
