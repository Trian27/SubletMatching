const DEFAULT_BASE = "http://localhost:3001";

export function getListingsApiBase() {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? DEFAULT_BASE;
  return base;
}

/** Optional; set from Supabase session after login (e.g. session.access_token). */
export function getListingsAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("sublet_access_token");
}

/**
 * POST /listings — body matches backend (price_monthly, campus_location, etc.).
 * @param {Record<string, unknown>} payload
 * @param {{ accessToken?: string | null }} [options]
 */
export async function createListing(payload, options = {}) {
  let token = options.accessToken ?? getListingsAccessToken();
  // Avoid sending bogus headers like "Bearer undefined".
  if (typeof token !== "string") token = null;
  token = token?.trim?.() ?? null;
  if (token && token.length === 0) token = null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${getListingsApiBase()}/listings`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.error === "string" ? data.error : "Could not create listing.";
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return data;
}

/**
 * PUT /listings/:id
 * @param {string|number} id
 * @param {Record<string, unknown>} payload
 * @param {{ accessToken?: string | null }} [options]
 */
export async function updateListing(id, payload, options = {}) {
  let token = options.accessToken ?? getListingsAccessToken();
  if (typeof token !== "string") token = null;
  token = token?.trim?.() ?? null;
  if (token && token.length === 0) token = null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${getListingsApiBase()}/listings/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.error === "string" ? data.error : "Could not update listing.";
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return data;
}

/**
 * DELETE /listings/:id
 * @param {string|number} id
 * @param {{ accessToken?: string | null }} [options]
 */
export async function deleteListing(id, options = {}) {
  let token = options.accessToken ?? getListingsAccessToken();
  if (typeof token !== "string") token = null;
  token = token?.trim?.() ?? null;
  if (token && token.length === 0) token = null;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${getListingsApiBase()}/listings/${id}`, {
    method: "DELETE",
    headers,
  });

  if (response.status === 204) return;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data.error === "string" ? data.error : "Could not delete listing.";
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
}

/**
 * GET /listings/favorites
 * @param {{ accessToken?: string | null }} [options]
 */
export async function getFavorites(options = {}) {
  let token = options.accessToken ?? getListingsAccessToken();
  if (typeof token !== "string") token = null;
  token = token?.trim?.() ?? null;
  if (token && token.length === 0) token = null;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${getListingsApiBase()}/listings/favorites`, {
    method: "GET",
    headers,
  });

  const data = await response.json().catch(() => []);
  if (!response.ok) {
    const message =
      typeof data?.error === "string" ? data.error : "Could not load favorites.";
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return Array.isArray(data) ? data : [];
}

/**
 * POST /listings/favorites
 * @param {string|number} listingId
 * @param {{ accessToken?: string | null }} [options]
 */
export async function addFavorite(listingId, options = {}) {
  let token = options.accessToken ?? getListingsAccessToken();
  if (typeof token !== "string") token = null;
  token = token?.trim?.() ?? null;
  if (token && token.length === 0) token = null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${getListingsApiBase()}/listings/favorites`, {
    method: "POST",
    headers,
    body: JSON.stringify({ listing_id: listingId }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data?.error === "string" ? data.error : "Could not add favorite.";
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return data;
}

/**
 * DELETE /listings/favorites/:favoriteId
 * @param {string|number} favoriteId
 * @param {{ accessToken?: string | null }} [options]
 */
export async function removeFavorite(favoriteId, options = {}) {
  let token = options.accessToken ?? getListingsAccessToken();
  if (typeof token !== "string") token = null;
  token = token?.trim?.() ?? null;
  if (token && token.length === 0) token = null;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(
    `${getListingsApiBase()}/listings/favorites/${favoriteId}`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (response.status === 204) return;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data?.error === "string" ? data.error : "Could not remove favorite.";
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
}
