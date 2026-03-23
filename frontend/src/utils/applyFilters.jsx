export default function applyFilters(listings, filters) {
  return listings.filter((listing) => {
    const [minPrice, maxPrice] = filters.price;
    const listingBeds = Number(listing.beds ?? listing.bedrooms ?? 0);
    const listingPropertyType = (listing.propertyType || "").toLowerCase();

    if (listing.price < minPrice || listing.price > maxPrice) return false;

    if (filters.beds !== "any") {
      if (filters.beds === 3) {
        if (listingBeds < 3) return false;
      } else if (listingBeds !== filters.beds) {
        return false;
      }
    }

    if (
      filters.propertyType !== "all" &&
      listingPropertyType !== filters.propertyType
    ) {
      return false;
    }

    return true;
  });
}
