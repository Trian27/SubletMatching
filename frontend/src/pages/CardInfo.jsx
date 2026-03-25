import { Link, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import ErrorPage from "./ErrorPage";
import CardDescription from "../components/CardDescription";
import Sidebar from "../components/Sidebar";
import ListingImageGallery from "../components/ListingImageGallery";
import { useListings } from "../context/ListingsContext";
import { useAuth } from "../context/AuthContext";
import { deleteListing, updateListing } from "../api/listingsApi";

const CardInfo = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { getListingById, updateListing: updateListingInState, removeListing } =
    useListings();
  const foundListing = getListingById(params.listingId);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const accessToken = session?.access_token ?? null;

  const isOwner =
    Boolean(session?.user?.id) &&
    Boolean(foundListing?.host_id) &&
    String(session.user.id) === String(foundListing.host_id);
  const canShowActions = Boolean(accessToken) && isOwner;

  const initialEditValues = useMemo(() => {
    if (!foundListing) return null;
    return {
      title: foundListing.title ?? "",
      price: String(foundListing.price ?? ""),
      description: foundListing.description ?? "",
    };
  }, [foundListing]);

  if (foundListing) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-[1600px] px-6 py-8">
          <div className="grid grid-cols-1 gap-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to="/" className="w-fit text-lg font-medium text-red-600">
                ← Back to Search
              </Link>

              {canShowActions && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActionError("");
                      const init = initialEditValues;
                      if (init) {
                        setEditTitle(init.title);
                        setEditPrice(init.price);
                        setEditDescription(init.description);
                      }
                      setIsEditing((prev) => !prev);
                    }}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setActionError("");
                      setIsSaving(true);
                      try {
                        await deleteListing(foundListing.id, { accessToken });
                        removeListing(foundListing.id);
                        navigate("/");
                      } catch (err) {
                        setActionError(err.message || "Could not delete listing.");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Working..." : "Delete"}
                  </button>
                </div>
              )}
            </div>

            {actionError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </p>
            )}

            {canShowActions && isEditing && (
              <form
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setActionError("");
                  setIsSaving(true);
                  try {
                    const nextTitle = editTitle.trim();
                    const nextPriceMonthly = Number(editPrice);
                    const nextDescription = editDescription.trim();

                    const updated = await updateListing(
                      foundListing.id,
                      {
                        title: nextTitle,
                        price_monthly: nextPriceMonthly,
                        description: nextDescription,
                      },
                      { accessToken }
                    );

                    updateListingInState(foundListing.id, {
                      title: updated.title ?? nextTitle,
                      price: updated.price ?? nextPriceMonthly,
                      description: updated.description ?? nextDescription,
                    });

                    setIsEditing(false);
                  } catch (err) {
                    setActionError(err.message || "Could not update listing.");
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Title
                    </span>
                    <input
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Monthly price
                    </span>
                    <input
                      required
                      min="1"
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    />
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Description
                  </span>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </form>
            )}

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
