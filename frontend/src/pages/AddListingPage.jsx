import { Link, useNavigate } from "react-router-dom";
import AddListingForm from "../components/AddListingForm";
import { useListings } from "../context/ListingsContext";

function AddListingPage() {
  const navigate = useNavigate();
  const { addListing } = useListings();

  return (
    <div className="mx-auto max-w-[1800px] px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-red-600">Create Listing</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Compose a listing with live preview
          </h1>
        </div>

        <Link
          to="/"
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Cancel
        </Link>
      </div>

      <AddListingForm
        onCreated={(listing) => {
          addListing(listing);
          navigate("/");
        }}
      />
    </div>
  );
}

export default AddListingPage;
