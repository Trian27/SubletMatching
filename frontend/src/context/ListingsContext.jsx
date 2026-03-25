import { createContext, useContext, useEffect, useMemo, useState } from "react";
import listingsData from "../data/listings";
import { getListingsApiBase } from "../api/listingsApi";
import { getNextListingId, normalizeListing, normalizeListings } from "../utils/listingUtils";

const ListingsContext = createContext(null);

export function ListingsProvider({ children }) {
  const fallbackListings = useMemo(() => normalizeListings(listingsData), []);
  const [listings, setListings] = useState(fallbackListings);
  const [hasLoadedFromApi, setHasLoadedFromApi] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadListingsFromApi() {
      try {
        const response = await fetch(`${getListingsApiBase()}/listings`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Could not load listings from backend.");
        }

        if (!Array.isArray(data)) {
          throw new Error("Invalid listings response.");
        }

        const normalized = normalizeListings(
          data.map((item) => ({
            ...item,
            campus: item.campus ?? item.campus_location ?? "",
            image: item.image ?? item.image_url ?? "",
          }))
        );

        if (!isCancelled) {
          setListings(normalized);
          setHasLoadedFromApi(true);
        }
      } catch (error) {
        console.warn("Could not load listings from backend; using fallback data.", error);
        if (!isCancelled) {
          setHasLoadedFromApi(true);
        }
      }
    }

    loadListingsFromApi();

    return () => {
      isCancelled = true;
    };
  }, []);

  const addListing = (listingInput) => {
    setListings((prev) => {
      const nextListing = normalizeListing({
        ...listingInput,
        id:
          listingInput.id != null && listingInput.id !== ""
            ? listingInput.id
            : getNextListingId(prev),
      });

      return [nextListing, ...prev];
    });
  };

  const updateListing = (id, patch) => {
    setListings((prev) => {
      const idx = prev.findIndex((listing) => String(listing.id) === String(id));
      if (idx === -1) return prev;

      const updated = normalizeListing({
        ...prev[idx],
        ...patch,
        id: prev[idx].id,
      });

      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  };

  const removeListing = (id) => {
    setListings((prev) =>
      prev.filter((listing) => String(listing.id) !== String(id))
    );
  };

  const getListingById = (id) =>
    listings.find((listing) => String(listing.id) === String(id)) ?? null;

  const value = {
    listings,
    hasLoadedFromApi,
    addListing,
    updateListing,
    removeListing,
    getListingById,
  };

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
