const CAMPUSES = [
  { name: "College Ave", latitude: 40.50343, longitude: -74.45206 },
  { name: "Busch", latitude: 40.52372, longitude: -74.45855 },
  { name: "Livingston", latitude: 40.52531, longitude: -74.4365 },
  { name: "Cook/Douglass", latitude: 40.48098, longitude: -74.43654 },
];

export function findNearestCampusByCoordinates(latitude, longitude) {
  return CAMPUSES.reduce((closestCampus, campus) => {
    const distance = haversineMiles(
      latitude,
      longitude,
      campus.latitude,
      campus.longitude
    );

    if (!closestCampus || distance < closestCampus.distance) {
      return {
        campus: campus.name,
        distance: Number(distance.toFixed(1)),
      };
    }

    return closestCampus;
  }, null);
}

export async function geocodeAddressToNearestCampus(address, signal) {
  const queries = buildGeocodeQueries(address);
  let lastError = null;

  for (const query of queries) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
          signal,
        }
      );

      if (!response.ok) {
        lastError = new Error("Could not reach the geocoding service.");
        continue;
      }

      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) continue;

      const topResult = results[0];
      const latitude = Number(topResult.lat);
      const longitude = Number(topResult.lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

      const nearestCampus = findNearestCampusByCoordinates(latitude, longitude);
      if (!nearestCampus) continue;

      return {
        latitude,
        longitude,
        campus: nearestCampus.campus,
        distance: nearestCampus.distance,
        formattedAddress: topResult.display_name,
      };
    } catch (error) {
      if (error.name === "AbortError") throw error;
      lastError = error;
    }
  }

  throw lastError ?? new Error("We could not estimate the nearest campus from that address.");
}

function buildGeocodeQueries(address) {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) return [];

  const normalizedAddress = trimmedAddress.replace(/\s+/g, " ");
  const hasLocalHint = /(new brunswick|piscataway|highland park|somerset|new jersey|\bnj\b)/i.test(
    normalizedAddress
  );

  if (hasLocalHint) return [normalizedAddress];

  return [`${normalizedAddress}, New Brunswick, NJ`, normalizedAddress];
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const originLat = toRadians(lat1);
  const targetLat = toRadians(lat2);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) *
      Math.cos(targetLat) *
      Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}
