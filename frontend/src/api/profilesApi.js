import { buildAuthHeaders, getListingsAccessToken, getListingsApiBase } from "./listingsApi";

async function parseJson(response) {
  return response.json().catch(() => ({}));
}

async function handleResponse(response, fallbackMessage) {
  const data = await parseJson(response);
  if (!response.ok) {
    const error = new Error(
      typeof data.error === "string" ? data.error : fallbackMessage
    );
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function getMyProfile(options = {}) {
  const response = await fetch(`${getListingsApiBase()}/profiles/me`, {
    headers: buildAuthHeaders(options.accessToken ?? getListingsAccessToken()),
  });

  return handleResponse(response, "Could not load profile.");
}

export async function saveMyProfile(payload, options = {}) {
  const response = await fetch(`${getListingsApiBase()}/profiles/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(options.accessToken ?? getListingsAccessToken()),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "Could not save profile.");
}
