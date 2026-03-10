import { createContext, useContext, useEffect, useMemo, useState } from "react";

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
  const [favorites, setFavorites] = useState(loadFavoritesFromStorage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
    }),
    [favorites]
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
