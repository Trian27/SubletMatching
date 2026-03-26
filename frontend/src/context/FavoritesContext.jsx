import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { addFavorite, getFavorites, removeFavorite } from "../api/listingsApi";
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
  const { session } = useAuth();
  const [favorites, setFavorites] = useState(loadFavoritesFromStorage);
  const [favoriteRowByListingId, setFavoriteRowByListingId] = useState(() => new Map());
  const prevAccessTokenRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    let cancelled = false;
    const accessToken = session?.access_token ?? null;
    const hadToken = Boolean(prevAccessTokenRef.current);
    prevAccessTokenRef.current = accessToken;

    if (!accessToken && hadToken) {
      setFavorites(new Set());
      setFavoriteRowByListingId(new Map());
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return;
    }

    async function loadRemoteFavorites() {
      if (!accessToken) return;

      try {
        const rows = await getFavorites({ accessToken });
        if (cancelled) return;

        const listingIds = new Set(rows.map((row) => row.listing_id));
        const rowMap = new Map(rows.map((row) => [String(row.listing_id), row.id]));
        setFavorites(listingIds);
        setFavoriteRowByListingId(rowMap);
      } catch (error) {
        console.warn("Could not load remote favorites", error);
      }
    }

    loadRemoteFavorites();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const toggleFavorite = useCallback(async (id) => {
    const listingKey = String(id);
    const accessToken = session?.access_token;

    if (!accessToken) {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      return;
    }

    if (favorites.has(id)) {
      const favoriteRowId = favoriteRowByListingId.get(listingKey);
      if (!favoriteRowId) return;
      await removeFavorite(favoriteRowId, { accessToken });
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setFavoriteRowByListingId((prev) => {
        const next = new Map(prev);
        next.delete(listingKey);
        return next;
      });
      return;
    }

    const created = await addFavorite(id, { accessToken });
    setFavorites((prev) => new Set([...prev, id]));
    setFavoriteRowByListingId((prev) => {
      const next = new Map(prev);
      next.set(listingKey, created.id);
      return next;
    });
  }, [session?.access_token, favorites, favoriteRowByListingId]);

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
