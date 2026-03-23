import { Link, useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import CardDescription from "../components/CardDescription";
import Sidebar from "../components/Sidebar";
import ListingImageGallery from "../components/ListingImageGallery";
import { useListings } from "../context/ListingsContext";

const CardInfo = () => {
    const params = useParams();
    const { getListingById } = useListings();
    const foundListing = getListingById(params.listingId);

  if (foundListing) {
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

  return <ErrorPage />;
};

export default CardInfo
