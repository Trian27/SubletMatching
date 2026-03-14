import { Link } from "react-router-dom";

// function ListingCard({ listing, isFavorited, onToggleFavorite }) {
//   const lId = listing.id;

//   const handleFavoriteClick = (event) => {
//     event.preventDefault();
//     event.stopPropagation();
//     onToggleFavorite(listing.id);
//   };

//   return (
//     <Link to={`/listings/${lId}`}>
//       <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
//         <div className="relative">
//           <img
//             src={listing.image}
//             alt={listing.title}
//             className="h-56 w-full object-cover"
//           />

//           <div className="absolute bottom-4 left-4 rounded-full bg-red-600 px-4 py-2 text-lg font-semibold text-white shadow">
//             ${listing.price}/mo
//           </div>

//           <button
//             type="button"
//             aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
//             onClick={handleFavoriteClick}
//             className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow"
//           >
//             {isFavorited ? "♥" : "♡"}
//           </button>
//         </div>

//         <div className="p-5">
//           <h2 className="text-3xl font-semibold text-slate-900">
//             {listing.title}
//           </h2>

//           <p className="mt-3 text-xl text-slate-600">
//             {listing.address}
//           </p>

//           <div className="mt-4 flex flex-wrap gap-6 text-lg text-slate-700">
//             <span>{listing.beds} beds</span>
//             <span>{listing.baths} baths</span>
//             <span>{listing.propertyType}</span>
//           </div>

//           <div className="mt-5 flex items-center justify-between border-t pt-4 text-lg">
//             <span className="text-slate-600">
//               {listing.distance} miles from campus
//             </span>
//             <span className="font-medium text-red-600">
//               {listing.availability}
//             </span>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }

// export default ListingCard;

function ListingCard({ listing, isFavorited, onToggleFavorite }) {
  const l_ID = listing.id
  const availRange =
    listing.available_from && listing.available_to
      ? `${formatDate(listing.available_from)} – ${formatDate(listing.available_to)}`
      : null;

  return (
    <Link to={`/listings/${lId}`}>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="relative bg-gradient-to-br from-red-500 to-red-700 px-6 py-8">
          <div className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-lg font-semibold text-red-600 shadow">
            ${listing.price}/mo
          </div>

          <button
            onClick={() => onToggleFavorite(listing.id)}
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
            {listing.address}{listing.city ? `, ${listing.city}` : ""}
          </p>

          {listing.description && (
            <p className="mt-2 text-base text-slate-500">{listing.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-6 text-lg text-slate-700">
            <span>{listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed${listing.bedrooms > 1 ? "s" : ""}`}</span>
            <span>{listing.bathrooms} bath{listing.bathrooms > 1 ? "s" : ""}</span>
            {listing.campus && (
              <span className="rounded-full bg-red-50 px-3 py-0.5 text-base font-medium text-red-600">
                {listing.campus}
              </span>
            )}
          </div>

          {availRange && (
            <div className="mt-5 border-t pt-4 text-lg">
              <span className="font-medium text-red-600">{availRange}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default ListingCard;
