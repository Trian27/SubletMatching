function FilterSidebar({ filters, setFilters }) {
  const handleBedsChange = (e) => {
    const value = e.target.value;

    setFilters((prev) => ({
      ...prev,
      beds: value === "any" ? "any" : Number(value),
    }));
  };

  const handlePropertyTypeChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: e.target.value,
    }));
  };

  const handleMaxDistanceChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      maxDistance: Number(e.target.value),
    }));
  };

  const handleMinPriceChange = (e) => {
    const newMin = Number(e.target.value);

    setFilters((prev) => ({
      ...prev,
      price: [newMin, prev.price[1]],
    }));
  };

  const handleMaxPriceChange = (e) => {
    const newMax = Number(e.target.value);

    setFilters((prev) => ({
      ...prev,
      price: [prev.price[0], newMax],
    }));
  };

  const toggleAmenity = (key) => {
    setFilters((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key],
      },
    }));
  };

  const resetFilters = () => {
    setFilters({
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
  };

  return (
    <aside className="sticky top-6 h-fit w-full max-w-xs rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
        <button
          onClick={resetFilters}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Bedrooms
          </label>
          <select
            value={filters.beds}
            onChange={handleBedsChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
          >
            <option value="any">Any</option>
            <option value="1">1 Bed</option>
            <option value="2">2 Beds</option>
            <option value="3">3 Beds</option>
            <option value="4">4+ Beds</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={handlePropertyTypeChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
          >
            <option value="all">All</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="studio">Studio</option>
            <option value="townhome">Townhome</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Price Range
          </label>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={filters.price[0]}
              onChange={handleMinPriceChange}
              placeholder="Min"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
            />

            <input
              type="number"
              value={filters.price[1]}
              onChange={handleMaxPriceChange}
              placeholder="Max"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Max Distance from Campus: {filters.maxDistance} mi
          </label>

          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={filters.maxDistance}
            onChange={handleMaxDistanceChange}
            className="w-full"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">Amenities</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => toggleAmenity("parking")}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                filters.amenities.parking
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              Parking
            </button>

            <button
              onClick={() => toggleAmenity("laundry")}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                filters.amenities.laundry
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              Laundry
            </button>

            <button
              onClick={() => toggleAmenity("petFriendly")}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                filters.amenities.petFriendly
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              Pet Friendly
            </button>

            <button
              onClick={() => toggleAmenity("furnished")}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                filters.amenities.furnished
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              Furnished
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;