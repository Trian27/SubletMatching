import { Link, useParams } from "react-router-dom";
import CardDescription from "../components/CardDescription";
import ListingImageGallery from "../components/ListingImageGallery";
import Sidebar from "../components/Sidebar";
import { useListings } from "../context/ListingsContext";
import ErrorPage from "./ErrorPage";

function CardInfo() {
  const { listingId } = useParams();
  const { getListingById } = useListings();
  const foundListing = getListingById(listingId);

  if (!foundListing) {
    return <ErrorPage />;
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="grid grid-cols-1 gap-8">
          <Link to="/" className="w-fit text-lg font-medium text-red-600">
            ← Back to Search
          </Link>

          <div className="w-full">
            <ListingImageGallery images={foundListing.images} title={foundListing.title} />
          </div>

          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <CardDescription foundListing={foundListing} />
            <Sidebar foundListing={foundListing} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardInfo;
