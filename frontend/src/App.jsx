import { useMemo, useState } from "react";
import FilterSidebar from "./components/FilterSidebar";
import ListingGrid from "./components/ListingGrid";
import listingsData from "./data/listings";
import applyFilters from "./utils/applyFilters";

function App() {
  const [filters, setFilters] = useState({
    price: [0, 5000],
    beds: "any",
    propertyType: "all",
    maxDistance: 10,
    amenities: {
      parking: false,
      laundry: false,
      petFriendly: false,
      furnished: false,
    },
  });

  const [favorites, setFavorites] = useState(new Set());

  const filteredListings = useMemo(() => {
    return applyFilters(listingsData, filters);
  }, [filters]);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-6 py-6">
        <FilterSidebar filters={filters} setFilters={setFilters} />

        <main className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Available Housing</p>
              <h1 className="text-3xl font-semibold text-slate-900">
                Showing {filteredListings.length} listings
              </h1>
            </div>
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

export default App;
