export default function applyFilters(listings, filters) {
  return listings.filter((listing) => {
    const [minPrice, maxPrice] = filters.price;

    if (listing.price < minPrice || listing.price > maxPrice) return false;

    if (filters.beds !== "any") {
      if (filters.beds === 3) {
        if (listing.bedrooms < 3) return false;
      } else if (listing.bedrooms !== filters.beds) {
        return false;
      }
    }

    if (filters.campus !== "all" && listing.campus !== filters.campus)
      return false;

    return true;
  });
}
