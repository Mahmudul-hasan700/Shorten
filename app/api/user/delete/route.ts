// app/api/user/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import Url from "@/models/Url";
import QRCode from "@/models/QRCode";
import Click from "@/models/Click";
import AnalyticsAggregation from "@/models/AnalyticsAggregation";
import dbConnect from "@/lib/mongodb";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get all user's URLs first
    const userUrls = await Url.find({ user: session.user.id });
    const urlIds = userUrls.map(url => url._id);

    // Delete all related data in parallel
    await Promise.all([
      // Delete all QR codes associated with user's URLs
      QRCode.deleteMany({ url: { $in: urlIds } }),

      // Delete all clicks associated with user's URLs
      Click.deleteMany({ url: { $in: urlIds } }),

      // Delete all analytics aggregations for user's URLs
      AnalyticsAggregation.deleteMany({
        $or: [{ url: { $in: urlIds } }, { user: session.user.id }]
      }),

      // Delete all URLs
      Url.deleteMany({ user: session.user.id }),

      // Finally delete the user
      User.findByIdAndDelete(session.user.id)
    ]);

    return NextResponse.json({
      success: true,
      message: "Account and all associated data deleted successfully"
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
