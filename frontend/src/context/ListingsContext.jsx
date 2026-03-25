import { createContext, useContext, useEffect, useMemo, useState } from "react";
import listingsData from "../data/listings";
import { getNextListingId, normalizeListing, normalizeListings } from "../utils/listingUtils";

const ListingsContext = createContext(null);
const STORAGE_KEY = "sublet_user_listings";

function loadUserListingsFromStorage() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return normalizeListings(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.warn("Could not load listings from localStorage", error);
    return [];
  }
}

export function ListingsProvider({ children }) {
  const baseListings = useMemo(() => normalizeListings(listingsData), []);
  const [userListings, setUserListings] = useState(loadUserListingsFromStorage);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userListings));
    } catch (error) {
      console.warn("Could not save listings to localStorage", error);
    }
  }, [userListings]);

  const listings = useMemo(
    () => [...userListings, ...baseListings],
    [baseListings, userListings]
  );

  const addListing = (listingInput) => {
    setUserListings((prev) => {
      const nextListing = normalizeListing({
        ...listingInput,
        id:
          listingInput.id != null && listingInput.id !== ""
            ? listingInput.id
            : getNextListingId([...baseListings, ...prev]),
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
