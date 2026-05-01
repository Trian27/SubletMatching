import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

function hashLooksLikeRecovery() {
  if (typeof window === "undefined") return false;
  const h = window.location.hash || "";
  return h.includes("type=recovery") || h.includes("type%3Drecovery");
}

/**
 * Landing page for the link in Supabase password-recovery email.
 * After PASSWORD_RECOVERY, user sets a new password via updateUser.
 */
function ResetPasswordPage() {
  const navigate = useNavigate();
  const { isConfigured } = useAuth();
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [showInvalidLink, setShowInvalidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!supabase || !isConfigured) {
      setSessionChecked(true);
      return undefined;
    }

    let cancelled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session?.user) {
        setRecoveryReady(true);
      }
      if (event === "SIGNED_IN" && session?.user && hashLooksLikeRecovery()) {
        setRecoveryReady(true);
      }
    });

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user && hashLooksLikeRecovery()) {
        setRecoveryReady(true);
      }
      setSessionChecked(true);
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  useEffect(() => {
    if (!sessionChecked || recoveryReady) {
      setShowInvalidLink(false);
      return undefined;
    }
    const t = window.setTimeout(() => setShowInvalidLink(true), 600);
    return () => window.clearTimeout(t);
  }, [sessionChecked, recoveryReady]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!supabase || !isConfigured) {
        throw new Error("Supabase is not configured.");
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccessMessage("Your password was updated. Redirecting…");
      window.setTimeout(() => navigate("/", { replace: true }), 1200);
    } catch (err) {
      setErrorMessage(err.message || "Could not update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-md px-6 py-10">
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase is not configured on this build.
        </p>
        <Link to="/login" className="mt-4 inline-block text-sm font-medium text-red-600">
          Back to sign in
        </Link>
      </div>
    );
  }

  if (!sessionChecked) {
    return (
      <div className="mx-auto max-w-md px-6 py-10 text-center text-sm text-slate-600">
        Verifying your link…
      </div>
    );
  }

  if (sessionChecked && !recoveryReady && !showInvalidLink) {
    return (
      <div className="mx-auto max-w-md px-6 py-10 text-center text-sm text-slate-600">
        Verifying your link…
      </div>
    );
  }

  if (sessionChecked && !recoveryReady && showInvalidLink) {
    return (
      <div className="mx-auto flex max-w-[1600px] justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-xl font-semibold text-slate-900">Link invalid or expired</h1>
          <p className="mb-6 text-sm text-slate-600">
            Use the link from your latest reset email, or request a new one.
          </p>
          <Link
            to="/auth/forgot-password"
            className="inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Request a new link
          </Link>
          <p className="mt-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1600px] justify-center px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm"
      >
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Set a new password</h1>
        <p className="mb-6 text-sm text-slate-600">Choose a password for your account.</p>

        <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
          required
          minLength={6}
          autoComplete="new-password"
        />

        <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
          required
          minLength={6}
          autoComplete="new-password"
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
          disabled={isSubmitting}
          className="w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Updating…" : "Update password"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/login" className="font-medium text-red-600 hover:text-red-700">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
