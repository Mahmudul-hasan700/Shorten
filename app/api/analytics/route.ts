import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Url from "@/models/Url";
import Click from "@/models/Click";
import AnalyticsAggregation from "@/models/AnalyticsAggregation";

export async function GET(req: Request): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const urlId = searchParams.get("urlId");
  const range = searchParams.get("range") || "7d";

  if (!urlId) {
    return NextResponse.json(
      { error: "URL ID is required" },
      { status: 400 }
    );
  }

  const url = await Url.findOne({
    _id: urlId,
    user: session.user.id
  });

  if (!url) {
    return NextResponse.json(
      { error: "URL not found" },
      { status: 404 }
    );
  }

  // Parse range
  const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[range] || 7;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  // Fetch clicks
  const clicks = await Click.find({
    url: urlId,
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: 1 });

  // Daily clicks calculation
  const dailyClicks = clicks.reduce<Record<string, number>>(
    (acc, click) => {
      const date = click.timestamp.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {}
  );

  const labels = Object.keys(dailyClicks);
  const data = Object.values(dailyClicks);
  const totalClicks = data.reduce((sum, clicks) => sum + clicks, 0);
  const growth = calculateGrowth(data);

  // Device breakdown
  const deviceBreakdown = clicks.reduce<Record<string, number>>(
    (acc, click) => {
      acc[click.device || 'other'] = (acc[click.device || 'other'] || 0) + 1;
      return acc;
    },
    {}
  );

  // Browser breakdown
  const browserBreakdown = clicks.reduce<Record<string, number>>(
    (acc, click) => {
      acc[click.browser || 'unknown'] = (acc[click.browser || 'unknown'] || 0) + 1;
      return acc;
    },
    {}
  );

  // Top referrers
  const topReferrers = clicks.reduce<Record<string, number>>(
    (acc, click) => {
      const referrer = click.referrer || 'Direct';
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    },
    {}
  );

  // Top countries
  const topCountries = clicks.reduce<Record<string, number>>(
    (acc, click) => {
      const country = click.location?.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    },
    {}
  );

  return NextResponse.json({
    labels,
    data,
    totalClicks,
    growth,
    deviceBreakdown,
    browserBreakdown,
    topReferrers: Object.entries(topReferrers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    topCountries: Object.entries(topCountries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  });
}

function calculateGrowth(data: number[]): number {
  if (data.length < 2) return 0;
  const mostRecent = data[data.length - 1] || 0;
  const previous = data[data.length - 2] || 0;
  if (previous === 0) return mostRecent > 0 ? 100 : 0;
  return ((mostRecent - previous) / previous) * 100;
}