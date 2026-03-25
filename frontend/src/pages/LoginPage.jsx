import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

function LoginPage() {
  const navigate = useNavigate();
  const { isConfigured, isReady, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState("signin");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const title = useMemo(
    () => (mode === "signin" ? "Sign In" : "Create Account"),
    [mode]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (!supabase || !isConfigured) {
        throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      }

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setSuccessMessage("Account created. Check your email if confirmation is enabled, then sign in.");
        setMode("signin");
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not authenticate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[1600px] justify-center px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm"
      >
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">{title}</h1>

        {!isConfigured && (
          <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Supabase frontend env vars are missing. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
          </p>
        )}

        {isConfigured && !isReady && (
          <p className="mb-4 text-sm text-slate-600">Restoring session...</p>
        )}

        {session?.user && (
          <p className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Signed in as {session.user.email}
          </p>
        )}

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
          placeholder="you@example.com"
          required
        />

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-red-200 focus:ring"
          placeholder="Enter password"
          required
          minLength={6}
        />

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        <div className="mt-8">
          <button
            type="submit"
            disabled={!isConfigured || isSubmitting}
            className="w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Please wait..." : title}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMode((prev) => (prev === "signin" ? "signup" : "signin"))}
          className="mt-4 w-full text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          {mode === "signin"
            ? "Need an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
