/**
 * Calculates straight-line distance in kilometers between two coordinates using the Haversine formula.
 *
 * @param travellerLat Latitude of traveller
 * @param travellerLng Longitude of traveller
 * @param destinationLat Latitude of destination
 * @param destinationLng Longitude of destination
 * @returns Remaining distance in kilometers (rounded to 1 decimal place)
 */
export function calculateDistanceKm(
  travellerLat: number,
  travellerLng: number,
  destinationLat: number,
  destinationLng: number
): number {
  const EARTH_RADIUS_KM = 6371;

  const toRad = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRad(destinationLat - travellerLat);
  const dLng = toRad(destinationLng - travellerLng);

  const lat1 = toRad(travellerLat);
  const lat2 = toRad(destinationLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Checks if a distance has crossed a threshold from above to below or equal.
 *
 * @param previousDistanceKm Previous distance in km (or null if first reading)
 * @param currentDistanceKm Current distance in km
 * @param thresholdKm Threshold in km (e.g. 100, 50, 25, 10)
 * @returns boolean
 */
export function hasCrossedThreshold(
  previousDistanceKm: number | null,
  currentDistanceKm: number,
  thresholdKm: number
): boolean {
  // If we have previous reading, it must have been strictly above threshold, and now at or below
  if (previousDistanceKm !== null) {
    return previousDistanceKm > thresholdKm && currentDistanceKm <= thresholdKm;
  }
  // If this is the first reading, trigger only if it is within the threshold
  return currentDistanceKm <= thresholdKm;
}
