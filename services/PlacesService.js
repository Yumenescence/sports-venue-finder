import Config from "../config";
import { getVenueTypeConfig, VENUE_TYPES } from "../constants/venueTypes";
import ApiClient from "./ApiClient";
import Logger from "./Logger";
import { mapV1PlaceToVenue } from "./models/PlacesModels";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isValidLocation = (loc) =>
  !!loc && typeof loc.lat === "number" && typeof loc.lng === "number";

const dedupeById = (items) => {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (!item || !item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
};

const resolveLanguage = () => {
  try {
    const loc = Intl.DateTimeFormat().resolvedOptions().locale;
    return (loc || "en").split("-")[0];
  } catch {
    return "en";
  }
};

const buildLocationBias = (biasLocation) => {
  if (biasLocation && isValidLocation(biasLocation)) {
    return `circle:${Math.max(5000, Config.SEARCH_RADIUS)}@${
      biasLocation.lat
    },${biasLocation.lng}`;
  }
  return "ipbias";
};

// Places API v1 constants
const PLACES_V1_SEARCH_TEXT_URL =
  "https://places.googleapis.com/v1/places:searchText";
const PLACES_V1_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.types",
  "places.priceLevel",
  "places.photos",
  "places.currentOpeningHours",
].join(",");

class PlacesService {
  constructor() {
    this.apiKey = Config.GOOGLE_PLACES_API_KEY;
    this.baseUrl = "https://maps.googleapis.com/maps/api/place";
    this.client = new ApiClient({
      maxConcurrency: Config.API?.MAX_CONCURRENCY,
      minIntervalMs: Config.API?.MIN_INTERVAL_MS,
      timeoutMs: Config.API?.TIMEOUT_MS,
    });
  }

  async geocodeAddress(query, biasLocation = null) {
    const lang = (
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().locale
        : "en"
    ).split("-")[0];

    const bias = biasLocation
      ? `circle:${Math.max(5000, Config.SEARCH_RADIUS)}@${biasLocation.lat},${
          biasLocation.lng
        }`
      : "ipbias";
    const findPlaceUrl = `${
      this.baseUrl
    }/findplacefromtext/json?input=${encodeURIComponent(
      query
    )}&inputtype=textquery&fields=geometry&language=${lang}&locationbias=${bias}&key=${
      this.apiKey
    }`;
    let data = await this.fetchJsonWithRetry(findPlaceUrl, 3);
    if (
      data.status === "OK" &&
      Array.isArray(data.candidates) &&
      data.candidates[0]
    ) {
      const loc = data.candidates[0].geometry?.location;
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
        return { lat: loc.lat, lng: loc.lng };
      }
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      query
    )}&language=${lang}&key=${this.apiKey}`;
    data = await this.fetchJsonWithRetry(geocodeUrl, 3);
    if (
      data.status === "OK" &&
      Array.isArray(data.results) &&
      data.results[0]
    ) {
      const loc = data.results[0].geometry?.location;
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
        return { lat: loc.lat, lng: loc.lng };
      }
    }

    throw new Error(`Geocoding failed: ${data.status}`);
  }

  async autocomplete(query, biasLocation = null) {
    const lang = resolveLanguage();
    const bias = buildLocationBias(biasLocation);
    const url = `${this.baseUrl}/autocomplete/json?input=${encodeURIComponent(
      query
    )}&types=geocode&language=${lang}&locationbias=${bias}&key=${this.apiKey}`;
    const data = await this.fetchJsonWithRetry(url, 3);
    if (data.status === "OK" && Array.isArray(data.predictions)) {
      return data.predictions.map((p) => ({
        id: p.place_id,
        description: p.description,
        types: p.types,
      }));
    }
    return [];
  }

  async searchPlaces(query, location = null, types = []) {
    try {
      return await this.searchPlacesInternal(query, location, types);
    } catch (error) {
      console.error("PlacesService.searchPlaces failed:", error);
      throw error;
    }
  }

  async searchPlacesInternal(query, location = null, types = []) {
    const center = location || (await this.geocodeAddress(query, location));
    const response = await this.searchNearbyPlacesInternal(center, types, null);
    return {
      results: response.results,
      cursors: response.cursors || null,
      hasMore: response.hasMore || false,
      center,
    };
  }

  async searchNearbyPlaces(location, types = [], pageTokensByType = null) {
    try {
      const response = await this.searchNearbyPlacesInternal(
        location,
        types,
        pageTokensByType
      );
      return {
        results: response.results,
        cursors: response.cursors,
        hasMore: response.hasMore,
      };
    } catch (error) {
      console.error("Error searching nearby places:", error);
      throw error;
    }
  }

  async searchNearbyPlacesInternal(
    location,
    types = [],
    pageTokensByType = null
  ) {
    if (!Array.isArray(types)) types = [];

    if (types.length === 0) {
      types = Object.values(VENUE_TYPES).map((v) => v.id);
    }

    if (types.length > 0) {
      const parts = await Promise.all(
        types.map(async (t) => {
          const keyword = getVenueTypeConfig(t)?.searchKeywords?.[0] || t;
          const results = await this.searchTextV1(keyword, location);
          return (results || []).map((v) => ({
            ...v,
            types: Array.from(new Set([...(v.types || []), t])),
          }));
        })
      );
      const merged = dedupeById(parts.flat());
      const cursors = Object.fromEntries(types.map((t) => [t, null]));
      return { results: merged, cursors, hasMore: false };
    }

    const allKeywords = Object.values(VENUE_TYPES)
      .map((v) => v.searchKeywords?.[0])
      .filter(Boolean)
      .join(" OR ");
    const results = await this.searchTextV1(allKeywords || "sports", location);
    return { results: results || [], cursors: null, hasMore: false };
  }

  async searchTextV1(textQuery, center) {
    try {
      const url = PLACES_V1_SEARCH_TEXT_URL;
      const radiusMeters = Math.max(1000, Config.SEARCH_RADIUS || 5000);
      const body = {
        textQuery,
        languageCode: (typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().locale
          : "en"
        ).split("-")[0],
        locationBias:
          center &&
          typeof center.lat === "number" &&
          typeof center.lng === "number"
            ? {
                circle: {
                  center: { latitude: center.lat, longitude: center.lng },
                  radius: radiusMeters,
                },
              }
            : undefined,
      };

      Logger.info("places.searchText.request", { url, textQuery, center });
      const response = await this.client.fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
          "X-Goog-FieldMask": PLACES_V1_FIELD_MASK,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      Logger.info("places.searchText.response", {
        count: data?.places?.length || 0,
      });
      const places = Array.isArray(data.places) ? data.places : [];
      return places
        .map((p) => mapV1PlaceToVenue(p, this.apiKey))
        .filter(Boolean);
    } catch (e) {
      console.error("PlacesService.searchTextV1 failed:", e);
      return [];
    }
  }

  async fetchJsonWithRetry(request, maxAttempts = 3) {
    let attempt = 0;
    let backoffMs = 400;
    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const response = await this.client.fetch(request);
        const data = await response.json();
        const status = data?.status;
        if (!status || status === "OK" || status === "ZERO_RESULTS") {
          return data;
        }
        if (this.isRetryableStatus(status) && attempt < maxAttempts) {
          await delay(backoffMs);
          backoffMs *= 2;
          continue;
        }
        return data;
      } catch (e) {
        if (attempt >= maxAttempts) throw e;
        await delay(backoffMs);
        backoffMs *= 2;
      }
    }
    return { status: "UNKNOWN_ERROR", results: [] };
  }

  isRetryableStatus(status) {
    return (
      status === "OVER_QUERY_LIMIT" ||
      status === "INVALID_REQUEST" ||
      status === "UNKNOWN_ERROR"
    );
  }

  getPhotoUrl(photoReference, maxWidth = 400) {
    if (!photoReference) return null;
    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  formatPlaces(places) {
    if (!places || !Array.isArray(places)) {
      return [];
    }

    return places
      .filter((place) => {
        return (
          place &&
          place.place_id &&
          place.name &&
          place.geometry &&
          place.geometry.location &&
          typeof place.geometry.location.lat === "number" &&
          typeof place.geometry.location.lng === "number"
        );
      })
      .map((place) => ({
        id: place.place_id,
        name: place.name,
        address:
          place.formatted_address || place.vicinity || "Address not specified",
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        rating: place.rating || null,
        types: place.types || [],
        photoReference:
          place.photos && place.photos.length > 0
            ? place.photos[0].photo_reference
            : null,
        photoUrl:
          place.photos && place.photos.length > 0
            ? this.getPhotoUrl(place.photos[0].photo_reference)
            : null,
        isOpen: place.opening_hours?.open_now,
        priceLevel: place.price_level || null,
        primaryType: this.getPrimaryType(place.types || []),
      }));
  }

  getPrimaryType(types) {
    if (!types || !Array.isArray(types) || types.length === 0) {
      return "establishment";
    }

    const priorityTypes = [
      "gym",
      "stadium",
      "golf_course",
      "swimming_pool",
      "sports_complex",
      "sports_club",
    ];

    for (const type of priorityTypes) {
      if (types.includes(type)) {
        return type;
      }
    }

    return types[0] || "establishment";
  }
}

export default new PlacesService();
