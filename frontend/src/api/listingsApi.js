const DEFAULT_BASE = "http://localhost:3001";

export function getListingsApiBase() {
  return import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? DEFAULT_BASE;
}

export function getListingsAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("sublet_access_token");
}

export function buildAuthHeaders(token = getListingsAccessToken()) {
  const trimmed = typeof token === "string" ? token.trim() : "";
  return trimmed ? { Authorization: `Bearer ${trimmed}` } : {};
}

async function parseJson(response) {
  return response.json().catch(() => ({}));
}

async function handleResponse(response, fallbackMessage) {
  const data = await parseJson(response);

  if (!response.ok) {
    const message =
      typeof data.error === "string" ? data.error : fallbackMessage;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function getListings() {
  const response = await fetch(`${getListingsApiBase()}/listings`);
  return handleResponse(response, "Could not load listings.");
}

export async function getListingById(id) {
  const response = await fetch(`${getListingsApiBase()}/listings/${id}`);
  return handleResponse(response, "Could not load listing.");
}

export async function getMyListings(options = {}) {
  const response = await fetch(`${getListingsApiBase()}/listings/mine`, {
    headers: {
      ...buildAuthHeaders(options.accessToken),
    },
  });

  return handleResponse(response, "Could not load your listings.");
}

export async function createListing(payload, options = {}) {
  const response = await fetch(`${getListingsApiBase()}/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(options.accessToken),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "Could not create listing.");
}

export async function importListings(payload, options = {}) {
  const response = await fetch(`${getListingsApiBase()}/listings/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(options.accessToken),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "Could not import listings.");
}
