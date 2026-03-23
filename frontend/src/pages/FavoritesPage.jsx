import { useState, useEffect } from "react";
import ListingGrid from "../components/ListingGrid";
import { useFavorites } from "../context/FavoritesContext";

function FavoritesPage() {
  const API_URL = "http://localhost:3001";
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetch(`${API_URL}/listings`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch listings:", err);
        setLoading(false);
      });
  }, []);

  const favoriteListings = listings.filter((listing) =>
    favorites.has(listing.id)
  );

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-red-600">Saved Listings</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {loading ? (
            "Loading..."
          ) : favoriteListings.length === 0 ? (
            "No favorites yet"
          ) : (
            `${favoriteListings.length} favorite listing${
              favoriteListings.length === 1 ? "" : "s"
            }`
          )}
        </h1>
      </div>

      {!loading && favoriteListings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
          Favorite listings from the Listings page will show up here.
        </div>
      ) : !loading ? (
        <ListingGrid
          listings={favoriteListings}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      ) : null}
    </div>
  );
}

export default FavoritesPage;
