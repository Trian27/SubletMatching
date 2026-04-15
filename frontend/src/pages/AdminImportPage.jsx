import { useState } from "react";
import { importListings } from "../api/listingsApi";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

const SAMPLE_CSV = `title,address,price_monthly,campus_location,beds,baths,property_type,available_from,available_to,contact_email,contact_phone
Summer Sublet on Hamilton,12 Hamilton St New Brunswick NJ 08901,1200,College Ave,1,1,apartment,2026-05-25,2026-08-15,leasing@example.com,732-555-0200`;

function AdminImportPage() {
  const { session } = useAuth();
  const { profile } = useProfile();
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await importListings(
        { csvText },
        { accessToken: session?.access_token }
      );
      setResults(response);
    } catch (error) {
      setErrorMessage(error.message || "Could not import listings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile.is_admin) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          Admin access is required to import curated inventory.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-red-600">Admin Import</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Curate trusted Rutgers-area listing inventory
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-sm">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Paste CSV rows</span>
          <textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            className="min-h-64 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-red-500"
          />
        </label>

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 rounded-full bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isSubmitting ? "Importing..." : "Import listings"}
        </button>
      </form>

      {results.length > 0 && (
        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Import results</h2>
          <div className="mt-5 space-y-3">
            {results.map((result, index) => (
              <div
                key={`${result.title}-${index}`}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              >
                <div className="font-medium text-slate-900">{result.title}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {result.status}
                  {result.reason ? `: ${result.reason}` : ""}
                  {result.existing_id ? ` (existing #${result.existing_id})` : ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminImportPage;
