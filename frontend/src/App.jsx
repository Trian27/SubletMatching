import { useEffect, useMemo, useState } from "react";
import FilterSidebar from "./components/FilterSidebar";
import ListingGrid from "./components/ListingGrid";
import applyFilters from "./utils/applyFilters";

const API_URL = "http://localhost:3001";

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    price: [0, 5000],
    beds: "any",
    campus: "all",
  });

  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    fetch(`${API_URL}/listings`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch listings");
        return res.json();
      })
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredListings = useMemo(() => {
    return applyFilters(listings, filters);
  }, [listings, filters]);

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
                {loading
                  ? "Loading listings..."
                  : `Showing ${filteredListings.length} listings`}
              </h1>
              {error && (
                <p className="mt-1 text-sm text-red-500">
                  Could not connect to server — make sure the backend is running.
                </p>
              )}
            </div>
          </div>

          {!loading && (
            <ListingGrid
              listings={filteredListings}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
