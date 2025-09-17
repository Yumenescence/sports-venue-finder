import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import PlacesService from "../services/PlacesService";

const PAGE_SIZE = 20;
const resultsCache = new Map();

export default function useVenues({ query, center, types, enabled = true }) {
  const key = [
    "venues",
    query || "",
    center?.lat || null,
    center?.lng || null,
    (types || []).join(","),
  ];

  const cacheKey = JSON.stringify([
    query || "",
    center?.lat || null,
    center?.lng || null,
    (types || []).join(","),
  ]);

  useEffect(() => {
    return () => {
      resultsCache.delete(cacheKey);
    };
  }, [cacheKey]);

  return useInfiniteQuery({
    queryKey: key,
    enabled,
    staleTime: 30_000,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? { offset: lastPage.nextOffset } : undefined,
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam && pageParam.offset) || 0;

      let fullResults = resultsCache.get(cacheKey);
      if (!fullResults) {
        if (Array.isArray(types) && types.length > 0) {
          const res = await PlacesService.searchNearbyPlaces(
            center || null,
            types,
            null
          );
          fullResults = res?.results || [];
        } else if (query && typeof query === "string" && query.trim()) {
          const res = await PlacesService.searchPlaces(
            query.trim(),
            center || null,
            []
          );
          fullResults = res?.results || [];
        } else if (center) {
          const res = await PlacesService.searchNearbyPlaces(center, [], null);
          fullResults = res?.results || [];
        } else {
          fullResults = [];
        }
        resultsCache.set(cacheKey, fullResults);
      }

      const pageItems = fullResults.slice(offset, offset + PAGE_SIZE);
      const hasMore = offset + PAGE_SIZE < fullResults.length;
      return {
        results: pageItems,
        hasMore,
        nextOffset: hasMore ? offset + PAGE_SIZE : null,
        cursors: null,
      };
    },
  });
}
