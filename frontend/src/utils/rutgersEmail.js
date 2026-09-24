// Rutgers-only sign-up. Mirrors backend/rutgersEmail.js and the
// enforce_rutgers_email_domain trigger in Supabase (the real enforcement).
// Allowed: rutgers.edu and any subdomain, e.g. scarletmail.rutgers.edu.
const ALLOWED_DOMAINS = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS || "rutgers.edu")
  .split(",")
  .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
  .filter(Boolean);

export const RUTGERS_EMAIL_HINT =
  "Use your Rutgers email (netid@scarletmail.rutgers.edu or first.last@rutgers.edu). Only verified Rutgers students can join.";

export function isAllowedEmail(email) {
  if (typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) return false;
  const domain = normalized.slice(at + 1);
  return ALLOWED_DOMAINS.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
  );
}
