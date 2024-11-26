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
  try {
    const { shortCode } = params;

    // Connect to the database
    await dbConnect();

    // Find the URL by its short code, explicitly checking for active status
    const url = await Url.findOne({ 
      $or: [
        { shortCode },
        { customAlias: shortCode }
      ],
      status: 'active' 
    });

    if (!url) {
      return NextResponse.json(
        { error: "URL not found or inactive" },
        { status: 404 }
      );
    }

    // Check for URL expiration
    if (url.expiresAt && url.expiresAt < new Date()) {
      url.status = 'expired';
      await url.save();
      return NextResponse.json(
        { error: "URL has expired" },
        { status: 410 }
      );
    }

    // Extract click data from the request
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");
    const referrer = req.headers.get("referer") || null;

    // Parse user-agent details
    const { browser, os, device } = parseUserAgent(userAgent);

    // Get location details from IP
    const location = await getLocation(ip);

    // Create and save click record
    const click = new Click({
      url: url._id,
      ip,
      userAgent,
      device,
      browser,
      os,
      referrer,
      location: location || {},
      customParams: {}
    });
    await click.save();

    // Increment click count
    await url.incrementClicks();

    // Redirect to original URL
    return NextResponse.redirect(url.originalUrl);
  } catch (error) {
    console.error("Error handling short URL redirection:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}