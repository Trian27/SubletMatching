import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

function ProfilePage() {
  const { user } = useAuth();
  const { profile, isLoading, errorMessage, updateProfile } = useProfile();
  const [formState, setFormState] = useState(profile);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormState(profile);
  }, [profile]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    setIsSaving(true);

    try {
      await updateProfile(formState);
      setStatusMessage("Profile saved.");
    } catch (error) {
      setStatusMessage(error.message || "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-red-600">Your Profile</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Complete the information both renters and hosts need
        </h1>
      </div>

      {!user && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
          Sign in first to save your profile.
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
            <input
              name="full_name"
              value={formState.full_name || ""}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-red-500"
              placeholder="Scarlet Knight"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Rutgers affiliation</span>
            <input
              name="rutgers_affiliation"
              value={formState.rutgers_affiliation || ""}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-red-500"
              placeholder="Junior at Rutgers New Brunswick"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Preferred contact method</span>
            <select
              name="preferred_contact_method"
              value={formState.preferred_contact_method || "email"}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="either">Either</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Phone</span>
            <input
              name="phone"
              value={formState.phone || ""}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-red-500"
              placeholder="732-555-0148"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4">
            <input
              type="checkbox"
              name="is_renter"
              checked={Boolean(formState.is_renter)}
              onChange={handleChange}
            />
            <span className="text-slate-700">I am looking for housing</span>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4">
            <input
              type="checkbox"
              name="is_host"
              checked={Boolean(formState.is_host)}
              onChange={handleChange}
            />
            <span className="text-slate-700">I want to post a property</span>
          </label>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Signed in as {profile.email || user?.email || "unknown email"}
        </div>

        {statusMessage && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
            {statusMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!user || isSaving || isLoading}
          className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
