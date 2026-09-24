/**
 * Rutgers-only access.
 *
 * Allowed: scarletmail.rutgers.edu, rutgers.edu, and any *.rutgers.edu
 * subdomain (e.g. rwjms.rutgers.edu, business.rutgers.edu).
 * Override with ALLOWED_EMAIL_DOMAINS (comma-separated). Each entry also
 * allows its subdomains.
 */
const DEFAULT_ALLOWED_DOMAINS = ['rutgers.edu']

export function getAllowedEmailDomains() {
  const raw = process.env.ALLOWED_EMAIL_DOMAINS
  if (!raw) return DEFAULT_ALLOWED_DOMAINS
  const domains = raw
    .split(',')
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean)
  return domains.length ? domains : DEFAULT_ALLOWED_DOMAINS
}

export function isAllowedEmail(email, allowedDomains = getAllowedEmailDomains()) {
  if (typeof email !== 'string') return false
  const normalized = email.trim().toLowerCase()
  const at = normalized.lastIndexOf('@')
  if (at <= 0 || at === normalized.length - 1) return false
  const domain = normalized.slice(at + 1)
  return allowedDomains.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
  )
}
