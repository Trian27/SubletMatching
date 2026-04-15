import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import listingsData from "../data/listings";
import { getListingById as fetchListing, getListings } from "../api/listingsApi";
import { normalizeListing, normalizeListings } from "../utils/listingUtils";

const ListingsContext = createContext(null);

export function ListingsProvider({ children }) {
  const fallbackListings = useMemo(() => normalizeListings(listingsData), []);
  const [listings, setListings] = useState(fallbackListings);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [source, setSource] = useState("fallback");

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getListings();
        if (!isMounted) return;
        setListings(normalizeListings(data));
        setSource("api");
      } catch (error) {
        if (!isMounted) return;
        setListings(fallbackListings);
        setSource("fallback");
        setErrorMessage(
          error.message || "Showing fallback listings while the API is unavailable."
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadListings();

    return () => {
      isMounted = false;
    };
  }, [fallbackListings]);

  const addListing = useCallback((listingInput) => {
    setListings((prev) => [normalizeListing(listingInput), ...prev]);
    setSource((prev) => (prev === "api" ? prev : "mixed"));
  }, []);

  const getListingById = useCallback(
    (id) => listings.find((listing) => String(listing.id) === String(id)) ?? null,
    [listings]
  );

  const refreshListings = useCallback(async () => {
    const data = await getListings();
    setListings(normalizeListings(data));
    setSource("api");
    setErrorMessage("");
  }, []);

  const fetchListingById = useCallback(async (id) => {
    const existing = getListingById(id);
    if (existing) return existing;

    const data = await fetchListing(id);
    const normalized = normalizeListing(data);
    setListings((prev) => {
      if (prev.some((listing) => String(listing.id) === String(normalized.id))) {
        return prev;
      }
      return [normalized, ...prev];
    });
    return normalized;
  }, [getListingById]);

  const value = useMemo(
    () => ({
      listings,
      isLoading,
      errorMessage,
      source,
      addListing,
      getListingById,
      fetchListingById,
      refreshListings,
    }),
    [
      addListing,
      errorMessage,
      fetchListingById,
      getListingById,
      isLoading,
      listings,
      refreshListings,
      source,
    ]
  );

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useListings() {
  const ctx = useContext(ListingsContext);

  if (!ctx) {
    throw new Error("useListings must be used inside ListingsProvider");
  }

  return ctx;
}
