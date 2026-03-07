export default function applyFilters(listings, filters) {
  return listings.filter((listing) => {
    const [minPrice, maxPrice] = filters.price;

    if (listing.price < minPrice || listing.price > maxPrice) return false;

    if (filters.beds !== "any" && listing.beds !== filters.beds) return false;

    if (
      filters.propertyType !== "all" &&
      listing.propertyType !== filters.propertyType
    )
      return false;

    if (listing.distance > filters.maxDistance) return false;

    for (const key in filters.amenities) {
      if (filters.amenities[key] && !listing.amenities[key]) return false;
    }

    return true;
  });
}