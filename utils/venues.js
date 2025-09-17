import {
  getVenueConfigByGoogleTypes,
  getVenueTypeConfig,
} from "../constants/venueTypes";

export const buildSearchQuery = (baseQuery, selectedTypes = []) => {
  if (!selectedTypes.length) return baseQuery;
  const keywords = selectedTypes
    .map((typeId) => {
      const config = getVenueTypeConfig(typeId);
      return config ? config.searchKeywords[0] : typeId;
    })
    .join(" OR ");
  return `${baseQuery} (${keywords})`;
};

export const filterVenuesByType = (venues, selectedTypes = []) => {
  if (!selectedTypes.length) return venues;
  return venues.filter((venue) => {
    const venueConfig = getVenueConfigByGoogleTypes(venue.types);
    return selectedTypes.includes(venueConfig.id);
  });
};
