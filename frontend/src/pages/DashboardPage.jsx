import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyListings } from "../api/listingsApi";
import {
  getReceivedInquiries,
  getSentInquiries,
  updateInquiryStatus,
} from "../api/inquiriesApi";
import { useAuth } from "../context/AuthContext";
import { useListings } from "../context/ListingsContext";
import { useProfile } from "../context/ProfileContext";

function DashboardPage() {
  const { user, session } = useAuth();
  const { refreshListings } = useListings();
  const { profile } = useProfile();
  const [myListings, setMyListings] = useState([]);
  const [sentInquiries, setSentInquiries] = useState([]);
  const [receivedInquiries, setReceivedInquiries] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const [listingRows, sentRows, receivedRows] = await Promise.all([
          getMyListings({ accessToken: session?.access_token }),
          getSentInquiries({ accessToken: session?.access_token }),
          getReceivedInquiries({ accessToken: session?.access_token }),
        ]);

        if (!isMounted) return;
        setMyListings(listingRows);
        setSentInquiries(sentRows);
        setReceivedInquiries(receivedRows);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error.message || "Could not load dashboard.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [session?.access_token, user]);

  const handleStatusChange = async (inquiryId, status) => {
    const updated = await updateInquiryStatus(inquiryId, status, {
      accessToken: session?.access_token,
    });

    setReceivedInquiries((prev) =>
      prev.map((inquiry) =>
        inquiry.id === inquiryId ? { ...inquiry, status: updated.status } : inquiry
      )
    );
  };

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-red-600">Marketplace Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Track listings and off-platform inquiries
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            to="/profile"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
          >
            Edit profile
          </Link>
          {Boolean(profile?.is_admin) && (
            <Link
              to="/admin/import"
              className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Admin import
            </Link>
          )}
          <button
            type="button"
            onClick={() => refreshListings().catch(() => null)}
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Refresh listings
          </button>
        </div>
      </div>

      {!user && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          Sign in to see your host and renter activity.
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </div>
      )}

      {user && (
        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Your listings</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isLoading ? "Loading..." : `${myListings.length} active listings`}
            </p>
            <div className="mt-5 space-y-4">
              {myListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.id}`}
                  className="block rounded-2xl border border-slate-200 px-4 py-4 hover:border-slate-300"
                >
                  <div className="font-medium text-slate-900">{listing.title}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {listing.address || listing.campus_location}
                  </div>
                  <div className="mt-2 text-sm text-red-600">${listing.price}/month</div>
                </Link>
              ))}
              {myListings.length === 0 && !isLoading && (
                <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  Post your first sublet to start receiving inquiries.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Inbound inquiries</h2>
            <div className="mt-5 space-y-4">
              {receivedInquiries.map((inquiry) => (
                <article key={inquiry.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{inquiry.listing_title}</div>
                      <div className="text-sm text-slate-500">{inquiry.listing_address}</div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{inquiry.message}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(inquiry.id, "responded")}
                      className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700"
                    >
                      Mark responded
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(inquiry.id, "closed")}
                      className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700"
                    >
                      Close
                    </button>
                  </div>
                </article>
              ))}
              {receivedInquiries.length === 0 && !isLoading && (
                <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  New renter outreach will appear here.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Sent inquiries</h2>
            <div className="mt-5 space-y-4">
              {sentInquiries.map((inquiry) => (
                <article key={inquiry.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-medium text-slate-900">{inquiry.listing_title}</div>
                  <div className="text-sm text-slate-500">{inquiry.listing_address}</div>
                  <p className="mt-3 text-sm text-slate-700">{inquiry.message}</p>
                  <div className="mt-3 text-xs uppercase tracking-wide text-red-600">
                    Status: {inquiry.status}
                  </div>
                </article>
              ))}
              {sentInquiries.length === 0 && !isLoading && (
                <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  Your outreach to hosts will show up here.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
