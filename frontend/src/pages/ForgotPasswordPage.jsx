import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

function getPasswordResetRedirectTo() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/auth/reset-password`;
}

/**
 * Request a password change: Supabase emails a link that opens /auth/reset-password.
 */
function ForgotPasswordPage() {
  const { isConfigured, user } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (!supabase || !isConfigured) {
        throw new Error(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
        );
      }

      const trimmed = email.trim();
      if (!trimmed) {
        throw new Error("Enter your email address.");
      }

      const redirectTo = getPasswordResetRedirectTo();
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      });
      if (error) throw error;

      setSuccessMessage(
        "Check your email for a link to set a new password. If it does not arrive in a few minutes, check spam or confirm this email matches your account."
      );
    } catch (err) {
      setErrorMessage(err.message || "Could not send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[1600px] justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Change password</h1>
        <p className="mb-6 text-sm text-slate-600">
          We&apos;ll email you a secure link. Open it to choose a new password.
        </p>

        {!isConfigured && (
          <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Supabase env vars are missing. Add <code className="text-xs">VITE_SUPABASE_URL</code>{" "}
            and <code className="text-xs">VITE_SUPABASE_ANON_KEY</code>.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
            placeholder="you@example.com"
            required
            readOnly={Boolean(user?.email)}
            autoComplete="email"
          />

          {errorMessage && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={!isConfigured || isSubmitting}
            className="w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/login" className="font-medium text-red-600 hover:text-red-700">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
