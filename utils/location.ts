import fetch from "node-fetch";

export async function getLocation(ip: string | null) {
  if (!ip) return null;
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching location data:", error);
  }
  return null; // Fallback if location lookup fails
}
