import type { LocationData } from "@/types/location";

export async function getLocation(
  ip: string | null
): Promise<LocationData | null> {
  if (!ip) return null;

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "URLShortener/1.0"
      }
    });

    if (!response.ok) {
      console.warn(
        `Location API returned status: ${response.status}`
      );
      return null;
    }

    const data: LocationData = await response.json();

    // Validate essential fields
    if (!data.country || !data.city) {
      console.warn("Incomplete location data received");
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching location data:", error);
    return null;
  }
}
