import { Link, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import ErrorPage from "./ErrorPage";
import CardDescription from "../components/CardDescription";
import Sidebar from "../components/Sidebar";
import ListingImageGallery from "../components/ListingImageGallery";
import { useListings } from "../context/ListingsContext";
import { useAuth } from "../context/AuthContext";
import { deleteListing, updateListing } from "../api/listingsApi";
import { isListingOwnedByUser } from "../utils/listingOwnershipCache";

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
  const [editFormData, setEditFormData] = useState(null);

  const accessToken = session?.access_token ?? null;

  const isOwner =
    Boolean(session?.user?.id) &&
    (String(session.user.id) === String(foundListing?.host_id) ||
      isListingOwnedByUser(foundListing?.id, session.user.id));
  const canShowActions = Boolean(accessToken) && isOwner;

  const initialEditValues = useMemo(() => {
    if (!foundListing) return null;
    return {
      title: foundListing.title ?? "",
      address: foundListing.address ?? "",
      price: String(foundListing.price ?? ""),
      beds: String(foundListing.beds ?? ""),
      baths: String(foundListing.baths ?? ""),
      propertyType: foundListing.propertyType ?? "apartment",
      available_from: foundListing.available_from ?? "",
      available_to: foundListing.available_to ?? "",
      landlordNum: foundListing.landlordNum ?? "",
      landlordEmail: foundListing.landlordEmail ?? "",
      description: foundListing.description ?? "",
      campus: foundListing.campus ?? "",
      distance: String(foundListing.distance ?? ""),
      amenities: {
        Parking: Boolean(foundListing.amenities?.Parking),
        Laundry: Boolean(foundListing.amenities?.Laundry),
        Pet_Friendly: Boolean(foundListing.amenities?.Pet_Friendly),
        Furnished: Boolean(foundListing.amenities?.Furnished),
      },
    };
  }, [foundListing]);

  const handleEditFieldChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditAmenityChange = (event) => {
    const { name, checked } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [name]: checked,
      },
    }));
  };

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
                      if (isEditing) {
                        setEditFormData(null);
                        setIsEditing(false);
                        return;
                      }

                      const init = initialEditValues;
                      if (init) {
                        setEditFormData(init);
                      }
                      setIsEditing(true);
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

{canShowActions && isEditing && editFormData && (
              <form
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setActionError("");
                  setIsSaving(true);
                  try {
                    const nextTitle = editFormData.title.trim();
                    const nextPriceMonthly = Number(editFormData.price);
                    const nextBeds = Number(editFormData.beds);
                    const nextBaths = Number(editFormData.baths);
                    const nextCampus = editFormData.campus.trim();
                    const nextDistance = Number(editFormData.distance);
                    const nextDescription = editFormData.description.trim();
                    const nextAmenities = editFormData.amenities;

                    const payload = {
                      title: nextTitle,
                      description: nextDescription || null,
                      price_monthly: nextPriceMonthly,
                      beds: nextBeds,
                      property_type: editFormData.propertyType,
                      campus_location: nextCampus || null,
                      distance: Number.isFinite(nextDistance) ? nextDistance : null,
                      amenities: nextAmenities,
                    };

                    const updated = await updateListing(
                      foundListing.id,
                      payload,
                      { accessToken }
                    );

                    updateListingInState(foundListing.id, {
                      title: updated.title ?? nextTitle,
                      price: updated.price ?? nextPriceMonthly,
                      beds: updated.beds ?? nextBeds,
                      baths: nextBaths,
                      propertyType: updated.propertyType ?? editFormData.propertyType,
                      campus: updated.campus_location ?? nextCampus,
                      distance: updated.distance ?? nextDistance,
                      amenities: updated.amenities ?? nextAmenities,
                      description: updated.description ?? nextDescription,
                      address: editFormData.address.trim(),
                      available_from: editFormData.available_from,
                      available_to: editFormData.available_to,
                      landlordNum: editFormData.landlordNum.trim(),
                      landlordEmail: editFormData.landlordEmail.trim(),
                    });

                    setIsEditing(false);
                    setEditFormData(null);
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
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditFieldChange}
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
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Address
                    </span>
                    <input
                      required
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Campus
                    </span>
                    <select
                      name="campus"
                      value={editFormData.campus}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    >
                      <option value="">Select campus</option>
                      <option value="College Ave">College Ave</option>
                      <option value="Busch">Busch</option>
                      <option value="Livingston">Livingston</option>
                      <option value="Cook/Douglass">Cook/Douglass</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Property type
                    </span>
                    <select
                      name="propertyType"
                      value={editFormData.propertyType}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="studio">Studio</option>
                      <option value="townhome">Townhome</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Bedrooms
                    </span>
                    <input
                      required
                      min="0"
                      type="number"
                      name="beds"
                      value={editFormData.beds}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Bathrooms
                    </span>
                    <input
                      required
                      min="0"
                      step="0.5"
                      type="number"
                      name="baths"
                      value={editFormData.baths}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Distance (miles)
                    </span>
                    <input
                      min="0"
                      step="0.1"
                      type="number"
                      name="distance"
                      value={editFormData.distance}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Available from
                    </span>
                    <input
                      type="date"
                      name="available_from"
                      value={editFormData.available_from}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Available to
                    </span>
                    <input
                      type="date"
                      name="available_to"
                      value={editFormData.available_to}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Phone
                    </span>
                    <input
                      type="tel"
                      name="landlordNum"
                      value={editFormData.landlordNum}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Email
                    </span>
                    <input
                      type="email"
                      name="landlordEmail"
                      value={editFormData.landlordEmail}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
                    />
                  </label>
                </div>

                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium text-slate-700">Amenities</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(editFormData.amenities).map(([key, checked]) => (
                      <label
                        key={key}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          name={key}
                          checked={checked}
                          onChange={handleEditAmenityChange}
                          className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        {key.replaceAll("_", " ")}
                      </label>
                    ))}
                  </div>
                </div>

                <label className="mt-4 block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Description
                  </span>
                  <textarea
                    rows={4}
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditFieldChange}
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
