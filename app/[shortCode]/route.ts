import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Url from "@/models/Url";
import Click from "@/models/Click";
import { parseUserAgent } from "@/utils/userAgentParser";
import { getLocation } from "@/utils/location";

export async function GET(
  req: Request,
  { params }: { params: { shortCode: string } }
) {
  // Early validation
  const { shortCode } = params;
  if (!shortCode || shortCode.trim() === "") {
    return NextResponse.json(
      { error: "Invalid short code" },
      { status: 400 }
    );
  }

  try {
    // Database connection
    await dbConnect();

    // Find URL
    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
      status: "active"
    });

    // URL not found or inactive
    if (!url) {
      return NextResponse.json(
        { error: "URL not found or inactive" },
        { status: 404 }
      );
    }

    // Check URL expiration
    if (url.expiresAt && url.expiresAt < new Date()) {
      url.status = "expired";
      await url.save();
      return NextResponse.json(
        { error: "URL has expired" },
        { status: 410 }
      );
    }

    // Extract request metadata
    const ip = extractIP(req);
    const userAgent = req.headers.get("user-agent") || "unknown";
    const referrer = req.headers.get("referer") || null;

    // Parse user agent
    const { browser, os, device } = parseUserAgent(userAgent) || {};

    // Get location data
    const location = await getLocation(ip);

    // Prepare click record
    const click = new Click({
      url: url._id,
      ip: anonymizeIP(ip),
      userAgent,
      device,
      browser,
      os,
      referrer,
      location: {
        country: location?.country,
        city: location?.city,
        region: location?.region,
        latitude: location?.latitude
          ? Math.round(location.latitude)
          : null,
        longitude: location?.longitude
          ? Math.round(location.longitude)
          : null
      },
      customParams: {}
    });

    // Save click record
    await saveClickRecord(click);

    // Increment URL clicks
    await incrementUrlClicks(url);

    // Redirect to original URL
    return NextResponse.redirect(url.originalUrl);
  } catch (error) {
    console.error("Redirection error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Helper functions
function extractIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function anonymizeIP(ip: string): string {
  return ip !== "unknown"
    ? ip.split(".").slice(0, 3).join(".") + ".0"
    : ip;
}

async function saveClickRecord(click: any) {
  try {
    await click.save();
  } catch (error) {
    console.error("Failed to save click record:", error);
  }
}

async function incrementUrlClicks(url: any) {
  try {
    await url.incrementClicks();
  } catch (error) {
    console.error("Failed to increment click count:", error);
  }
}
