import { createContext, useContext, useEffect, useMemo, useState } from "react";
import listingsData from "../data/listings";
import { getListingsApiBase } from "../api/listingsApi";
import { getNextListingId, normalizeListing, normalizeListings } from "../utils/listingUtils";

const ListingsContext = createContext(null);

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        const response = await fetch(`${getListingsApiBase()}/listings`);
        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) {
          throw new Error("Failed loading listings");
        }
        if (!cancelled) {
          setListings(normalizeListings(data));
        }
      } catch (error) {
        console.warn("Could not load API listings, using fallback", error);
        if (!cancelled) {
          setListings(normalizeListings(listingsData));
        }
      }
    }

    void loadListings();
    return () => {
      cancelled = true;
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

  const getListingById = (id) =>
    listings.find((listing) => String(listing.id) === String(id)) ?? null;

  const value = {
    listings,
    addListing,
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
