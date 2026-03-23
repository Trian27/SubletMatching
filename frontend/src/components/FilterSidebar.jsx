function FilterSidebar({ filters, setFilters }) {
  const handleBedsChange = (e) => {
    const value = e.target.value;

    setFilters((prev) => ({
      ...prev,
      beds: value === "any" ? "any" : Number(value),
    }));
  };

  const handleCampusChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      campus: e.target.value,
    }));
  };

  const handlePropertyTypeChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: e.target.value,
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

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [name]: checked,
      },
    }));
  };

  const handleMaxDistanceChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      maxDistance: Number(e.target.value),
    }));
  };

  const resetFilters = () => {
    setFilters({
      price: [0, 5000],
      beds: "any",
      campus: "all",
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
            <option value="0">Studio</option>
            <option value="1">1 Bed</option>
            <option value="2">2 Beds</option>
            <option value="3">3+ Beds</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Campus
          </label>
          <select
            value={filters.campus}
            onChange={handleCampusChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
          >
            <option value="all">All Campuses</option>
            <option value="College Ave">College Ave</option>
            <option value="Busch">Busch</option>
            <option value="Livingston">Livingston</option>
            <option value="Cook/Douglass">Cook/Douglass</option>
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
            <option value="all">Any Type</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
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
            Amenities
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="parking"
                name="parking"
                checked={filters.amenities.parking}
                onChange={handleAmenityChange}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="parking" className="ml-2 text-sm text-slate-700">
                Parking
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="laundry"
                name="laundry"
                checked={filters.amenities.laundry}
                onChange={handleAmenityChange}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="laundry" className="ml-2 text-sm text-slate-700">
                Laundry
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="petFriendly"
                name="petFriendly"
                checked={filters.amenities.petFriendly}
                onChange={handleAmenityChange}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="petFriendly" className="ml-2 text-sm text-slate-700">
                Pet Friendly
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="furnished"
                name="furnished"
                checked={filters.amenities.furnished}
                onChange={handleAmenityChange}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="furnished" className="ml-2 text-sm text-slate-700">
                Furnished
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Max Distance (miles)
          </label>
          <input
            type="number"
            value={filters.maxDistance}
            onChange={handleMaxDistanceChange}
            min="0"
            max="30" 
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
          />
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;
