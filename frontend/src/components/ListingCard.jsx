import { Link } from "react-router-dom";

function ListingCard({ listing, isFavorited, onToggleFavorite }) {
  const lId = listing.id;

  const handleFavoriteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite(listing.id);
  };

  return (
    <Link to={`/listings/${lId}`}>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="relative">
          <img
            src={listing.image}
            alt={listing.title}
            className="h-56 w-full object-cover"
          />

          <div className="absolute bottom-4 left-4 rounded-full bg-red-600 px-4 py-2 text-lg font-semibold text-white shadow">
            ${listing.price}/mo
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
          <h2 className="text-3xl font-semibold text-slate-900">
            {listing.title}
          </h2>

          <p className="mt-3 text-xl text-slate-600">
            {listing.address}
          </p>

          <div className="mt-4 flex flex-wrap gap-6 text-lg text-slate-700">
            <span>{listing.beds} beds</span>
            <span>{listing.baths} baths</span>
            <span>{listing.propertyType}</span>
          </div>

          <div className="mt-5 flex items-center justify-between border-t pt-4 text-lg">
            <span className="text-slate-600">
              {listing.distance} miles from campus
            </span>
            <span className="font-medium text-red-600">
              {listing.availability}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ListingCard;
