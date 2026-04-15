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

export async function createInquiry(payload, options = {}) {
  const response = await fetch(`${getListingsApiBase()}/inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(options.accessToken ?? getListingsAccessToken()),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "Could not send inquiry.");
}

export async function getSentInquiries(options = {}) {
  const response = await fetch(`${getListingsApiBase()}/inquiries/sent`, {
    headers: buildAuthHeaders(options.accessToken ?? getListingsAccessToken()),
  });

  return handleResponse(response, "Could not load sent inquiries.");
}

export async function getReceivedInquiries(options = {}) {
  const response = await fetch(`${getListingsApiBase()}/inquiries/received`, {
    headers: buildAuthHeaders(options.accessToken ?? getListingsAccessToken()),
  });

  return handleResponse(response, "Could not load received inquiries.");
}

export async function updateInquiryStatus(id, status, options = {}) {
  const response = await fetch(`${getListingsApiBase()}/inquiries/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(options.accessToken ?? getListingsAccessToken()),
    },
    body: JSON.stringify({ status }),
  });

  return handleResponse(response, "Could not update inquiry status.");
}
