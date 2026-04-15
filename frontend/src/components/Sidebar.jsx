import { useState } from "react";
import { createInquiry } from "../api/inquiriesApi";
import { useAuth } from "../context/AuthContext";

const DEFAULT_MESSAGE =
  "Hi, I am interested in this Rutgers sublet. Is it still available?";

const Sidebar = ({ foundListing }) => {
  const { user, session } = useAuth();
  const hasPhone = Boolean(foundListing.landlordNum);
  const hasEmail = Boolean(foundListing.landlordEmail);
  const isOwnListing = user && String(foundListing.host_id) === String(user.id);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [preferredContactMethod, setPreferredContactMethod] = useState("email");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInquirySubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      await createInquiry(
        {
          listing_id: foundListing.id,
          message,
          preferred_contact_method: preferredContactMethod,
        },
        { accessToken: session?.access_token }
      );
      setStatusMessage("Inquiry sent. The host can follow up off-platform.");
    } catch (error) {
      setStatusMessage(error.message || "Could not send inquiry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sticky top-24 h-fit rounded-2xl bg-gray-100 p-6">
      <h2 className="mb-6 text-3xl font-bold text-[#cc0033]">
        ${foundListing.price}/month
      </h2>

      <div>
        <h2 className="font-bold">Host contact</h2>
      </div>

      <div className="mt-2">
        {hasPhone ? (
          <a className="break-all hover:underline" href={`tel:${foundListing.landlordNum}`}>
            {foundListing.landlordNum}
          </a>
        ) : (
          <span className="text-slate-500">Phone not provided</span>
        )}
      </div>
      <div className="mt-1">
        {hasEmail ? (
          <a className="break-all hover:underline" href={`mailto:${foundListing.landlordEmail}`}>
            {foundListing.landlordEmail}
          </a>
        ) : (
          <span className="text-slate-500">Email not provided</span>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">Start an inquiry</h3>
        <p className="mt-1 text-sm text-slate-600">
          We log the outreach here first, then you and the host can continue by email or phone.
        </p>

        {!user && (
          <p className="mt-4 text-sm text-slate-600">
            Sign in to send an inquiry.
          </p>
        )}

        {isOwnListing && (
          <p className="mt-4 text-sm text-slate-600">
            This is your listing, so inquiry actions are disabled.
          </p>
        )}

        <form onSubmit={handleInquirySubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Preferred response method
            </span>
            <select
              value={preferredContactMethod}
              onChange={(event) => setPreferredContactMethod(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
              disabled={!user || isOwnListing}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="either">Either</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Message
            </span>
            <textarea
              rows="5"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
              disabled={!user || isOwnListing}
            />
          </label>

          {statusMessage && (
            <p className="text-sm text-slate-700">{statusMessage}</p>
          )}

          <button
            type="submit"
            disabled={!user || isOwnListing || isSubmitting}
            className="w-full rounded-lg bg-[#cc0033] py-3 font-medium text-white transition-colors hover:bg-[#a80029] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send inquiry"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;
