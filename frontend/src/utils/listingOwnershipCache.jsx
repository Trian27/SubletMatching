const LISTING_OWNERSHIP_KEY_PREFIX = "sublet_owned_listing_ids:";

function getOwnershipStorageKey(userId) {
  return `${LISTING_OWNERSHIP_KEY_PREFIX}${String(userId)}`;
}

export function getOwnedListingIds(userId) {
  if (!userId || typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getOwnershipStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => String(id)).filter(Boolean);
  } catch {
    return [];
  }
}

export function addOwnedListingId(userId, listingId) {
  if (!userId || listingId == null || typeof window === "undefined") {
    return;
  }

  const storageKey = getOwnershipStorageKey(userId);
  const existing = new Set(getOwnedListingIds(userId));
  existing.add(String(listingId));
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(existing)));
  } catch (error) {
    console.warn("Could not persist listing ownership cache.", error);
  }
}

export function isListingOwnedByUser(listingId, userId) {
  if (!userId || listingId == null) {
    return false;
  }
  return getOwnedListingIds(userId).includes(String(listingId));
}
