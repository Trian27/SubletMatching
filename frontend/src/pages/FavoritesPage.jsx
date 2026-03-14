import ListingGrid from "../components/ListingGrid";
import listingsData from "../data/listings";
import { useFavorites } from "../context/FavoritesContext";

function FavoritesPage() {
  
  const { favorites, toggleFavorite } = useFavorites();
  const favoriteListings = listingsData.filter((listing) =>
    favorites.has(listing.id)
  );

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-red-600">Saved Listings</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {favoriteListings.length === 0
            ? "No favorites yet"
            : `${favoriteListings.length} favorite listing${
                favoriteListings.length === 1 ? "" : "s"
              }`}
        </h1>
      </div>

      {favoriteListings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
          Favorite listings from the Listings page will show up here.
        </div>
      ) : (
        <ListingGrid
          listings={favoriteListings}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}

export default FavoritesPage;
