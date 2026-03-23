import { Link } from "react-router-dom";
import { formatAmenityLabel, normalizeListing } from "../utils/listingUtils";

function ListingCard({ listing, isFavorited, onToggleFavorite }) {
  const normalizedListing = normalizeListing(listing);
  const listingId = normalizedListing.id;
  const activeAmenities = Object.entries(normalizedListing.amenities ?? {})
    .filter(([, value]) => value)
    .map(([key]) => formatAmenityLabel(key));
  const availRange =
    normalizedListing.available_from && normalizedListing.available_to
      ? `${formatDate(normalizedListing.available_from)} - ${formatDate(
          normalizedListing.available_to
        )}`
      : null;
  const distanceLabel = normalizedListing.campus
    ? `${normalizedListing.distance} miles from ${normalizedListing.campus}`
    : `${normalizedListing.distance} miles from campus`;

  const handleFavoriteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite(normalizedListing.id);
  };

  return (
    <Link to={`/listings/${listingId}`}>
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="relative">
          <img
            src={normalizedListing.image}
            alt={normalizedListing.title}
            className="h-56 w-full object-cover"
          />

          <div className="absolute bottom-4 left-4 rounded-full bg-red-600 px-4 py-2 text-lg font-semibold text-white shadow">
            ${normalizedListing.price}/mo
          </div>

          <button
            type="button"
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            onClick={handleFavoriteClick}
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow"
          >
            {isFavorited ? "♥" : "♡"}
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-3xl font-semibold text-slate-900">
              {normalizedListing.title}
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium capitalize text-slate-700">
              {normalizedListing.propertyType}
            </span>
          </div>

          {normalizedListing.address && (
            <p className="mt-3 text-base text-slate-600">{normalizedListing.address}</p>
          )}

          {normalizedListing.description && (
            <p className="mt-3 line-clamp-2 text-base text-slate-500">
              {normalizedListing.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-6 text-lg text-slate-700">
            <span>{getBedroomLabel(normalizedListing.beds)}</span>
            {normalizedListing.baths > 0 && (
              <span>
                {normalizedListing.baths} bath{normalizedListing.baths === 1 ? "" : "s"}
              </span>
            )}
            <span>{distanceLabel}</span>
          </div>

          {activeAmenities.length > 0 && (
            <p className="mt-4 text-sm text-slate-500">{activeAmenities.join(" • ")}</p>
          )}

          {(availRange || normalizedListing.landlordEmail) && (
            <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4 text-sm">
              <span className="truncate text-slate-600">
                {normalizedListing.landlordEmail || "Contact info available in details"}
              </span>
              {availRange && <span className="font-medium text-red-600">{availRange}</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function getBedroomLabel(beds) {
  if (beds === 0) return "Studio";
  return `${beds} bed${beds === 1 ? "" : "s"}`;
}

function formatDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default ListingCard;
