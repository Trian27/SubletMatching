import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import FilterSidebar from "../components/FilterSidebar";
import ListingGrid from "../components/ListingGrid";
import applyFilters from "../utils/applyFilters";
import { useFavorites } from "../context/FavoritesContext";
import { useListings } from "../context/ListingsContext";

function ListingPage() {
  const { listings } = useListings();
  const { favorites, toggleFavorite } = useFavorites();
  const [filters, setFilters] = useState({
    price: [0, 5000],
    beds: "any",
    propertyType: "all",
  });

  const filteredListings = useMemo(() => {
    return applyFilters(listings, filters);
  }, [listings, filters]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-6 py-6">
        <FilterSidebar filters={filters} setFilters={setFilters} />

        <main className="flex-1">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-red-600">Available Housing</p>
              <h1 className="text-3xl font-semibold text-slate-900">
                Showing {filteredListings.length} listings
              </h1>
            </div>

            <Link
              to="/listings/new"
              aria-label="Add listing"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition hover:bg-red-700"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </Link>
          </div>

          <ListingGrid
            listings={filteredListings}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </main>
      </div>
    </div>
  );
}

export default ListingPage;
