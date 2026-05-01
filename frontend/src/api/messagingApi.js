import { getListingsAccessToken, getListingsApiBase } from "./listingsApi";

const DEFAULT_TIMEOUT_MS = 10000;

function buildAuthHeaders(accessToken) {
  let token = accessToken ?? getListingsAccessToken();
  if (typeof token !== "string") token = null;
  token = token?.trim?.() ?? null;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJsonResponse(response) {
  return response.json().catch(() => ({}));
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Check that the backend is running on port 3001.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function requestMessaging(path, options = {}) {
  const response = await fetchWithTimeout(`${getListingsApiBase()}/messages${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...buildAuthHeaders(options.accessToken),
      ...(options.headers ?? {}),
    },
  });
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message =
      typeof data.error === "string" ? data.error : "Messaging request failed.";
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return data;
}

export function startConversation(listingId, options = {}) {
  return requestMessaging("/conversations", {
    method: "POST",
    accessToken: options.accessToken,
    body: JSON.stringify({ listing_id: listingId }),
  });
}

export function getConversations(options = {}) {
  return requestMessaging("/conversations", {
    accessToken: options.accessToken,
  });
}

export function getMessages(conversationId, options = {}) {
  return requestMessaging(
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      accessToken: options.accessToken,
    }
  );
}

export function sendMessage(conversationId, body, options = {}) {
  return requestMessaging(
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      accessToken: options.accessToken,
      body: JSON.stringify({ body }),
    }
  );
}

export function markMessagesRead(conversationId, options = {}) {
  return requestMessaging(
    `/conversations/${encodeURIComponent(conversationId)}/read`,
    {
      method: "PATCH",
      accessToken: options.accessToken,
    }
  );
}
