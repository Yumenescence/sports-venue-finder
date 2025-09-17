/**
 * @typedef {Object} GeoPoint
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} Venue
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {GeoPoint} location
 * @property {number|null} rating
 * @property {string[]} types
 * @property {string|null} photoUrl
 * @property {boolean|null} isOpen
 * @property {number|null} priceLevel
 * @property {string|undefined} primaryType
 */

/**
 * @typedef {Object} AutocompletePrediction
 * @property {string} id
 * @property {string} description
 * @property {string[]} types
 */

export function buildPhotoUrl(photoName, apiKey, maxWidthPx = 400) {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${apiKey}`;
}

export function mapV1PlaceToVenue(placeV1, apiKey) {
  const latitude = placeV1?.location?.latitude;
  const longitude = placeV1?.location?.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  const photoName =
    Array.isArray(placeV1?.photos) && placeV1.photos[0]?.name
      ? placeV1.photos[0].name
      : null;

  return {
    id: placeV1?.id,
    name: placeV1?.displayName?.text || placeV1?.id,
    address: placeV1?.formattedAddress || "Address not specified",
    location: { lat: latitude, lng: longitude },
    rating: placeV1?.rating ?? null,
    types: Array.isArray(placeV1?.types) ? placeV1.types : [],
    photoUrl: photoName ? buildPhotoUrl(photoName, apiKey, 400) : null,
    isOpen: placeV1?.currentOpeningHours?.openNow ?? null,
    priceLevel: placeV1?.priceLevel ?? null,
    primaryType:
      Array.isArray(placeV1?.types) && placeV1.types[0]
        ? placeV1.types[0]
        : undefined,
  };
}
