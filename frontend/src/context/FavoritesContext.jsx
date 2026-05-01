import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addFavoriteListing,
  getFavoriteListings,
  removeFavoriteListing,
} from "../api/listingsApi";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);
const STORAGE_KEY = "sublet_favorites";

function loadFavoritesFromStorage() {
  if (typeof window === "undefined") return new Set();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Set();

    const parsed = JSON.parse(stored);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.warn("Could not load favorites from localStorage", error);
    return new Set();
  }
}

export function FavoritesProvider({ children }) {
  const { session, user, isConfigured } = useAuth();
  const [favorites, setFavorites] = useState(loadFavoritesFromStorage);
  const accessToken = session?.access_token ?? null;
  const shouldSyncRemoteFavorites = Boolean(isConfigured && user?.id && accessToken);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    if (!shouldSyncRemoteFavorites) return undefined;

    let isMounted = true;

    getFavoriteListings({ accessToken })
      .then((remoteFavorites) => {
        if (!isMounted) return;
        setFavorites(
          new Set(
            remoteFavorites
              .map((favorite) => favorite.listing_id)
              .filter((listingId) => listingId != null)
          )
        );
      })
      .catch((error) => {
        console.warn("Could not load remote favorites", error);
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, shouldSyncRemoteFavorites]);

  const toggleFavorite = useCallback(async (id) => {
    const wasFavorite = favorites.has(id);

    setFavorites((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

    if (!shouldSyncRemoteFavorites) return;

    try {
      if (wasFavorite) {
        await removeFavoriteListing(id, { accessToken });
      } else {
        await addFavoriteListing(id, { accessToken });
      }
    } catch (error) {
      setFavorites((prev) => {
        const next = new Set(prev);

        if (wasFavorite) {
          next.add(id);
        } else {
          next.delete(id);
        }

        return next;
      });
      console.warn("Could not update remote favorite", error);
    }
  }, [accessToken, favorites, shouldSyncRemoteFavorites]);

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
    }),
    [favorites, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  const ctx = useContext(FavoritesContext);

  if (!ctx) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }

  return ctx;
}
