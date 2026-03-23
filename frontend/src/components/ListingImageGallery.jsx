import { useState } from "react";
import { DEFAULT_LISTING_IMAGE } from "../utils/listingUtils";

function ListingImageGallery({ images, title, className = "" }) {
  const galleryImages =
    Array.isArray(images) && images.length > 0
      ? images
      : [
          {
            id: "listing-preview-placeholder",
            name: "Listing preview",
            url: DEFAULT_LISTING_IMAGE,
          },
        ];

  const [selectedImageId, setSelectedImageId] = useState(null);
  const activeImageId = galleryImages.some((image) => image.id === selectedImageId)
    ? selectedImageId
    : galleryImages[0].id;

  const activeImage =
    galleryImages.find((image) => image.id === activeImageId) || galleryImages[0];

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-lg bg-slate-100">
        <img
          src={activeImage.url}
          alt={title}
          className="h-[420px] w-full object-cover sm:h-[520px]"
        />
      </div>

      {galleryImages.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {galleryImages.map((image) => {
            const isActive = image.id === activeImage.id;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImageId(image.id)}
                className={`overflow-hidden rounded-lg border transition ${
                  isActive
                    ? "border-red-500 ring-2 ring-red-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-24 w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ListingImageGallery;
