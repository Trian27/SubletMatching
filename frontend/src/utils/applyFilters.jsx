export default function applyFilters(listings, filters) {
  return listings.filter((listing) => {
    const [minPrice, maxPrice] = filters.price;

    if (listing.price < minPrice || listing.price > maxPrice) return false;

    if (filters.beds !== "any") {
      if (filters.beds === 3) {
        if (listing.beds < 3) return false;
      } else if (listing.beds !== filters.beds) {
        return false;
      }
    }

    if (filters.campus !== "all" && listing.campus_location !== filters.campus)
      return false;

    if (filters.propertyType !== "all" && listing.propertyType !== filters.propertyType)
      return false;

    for (const amenity in filters.amenities) {
      if (filters.amenities[amenity] && !listing.amenities[amenity]) {
        return false;
      }
    }

    if (listing.distance > filters.maxDistance) {
      return false;
    }

    return true;
  });
}
