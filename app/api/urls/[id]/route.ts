import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Url from "@/models/Url";
import User from "@/models/User";
import Click from "@/models/Click";
import AnalyticsAggregation from "@/models/AnalyticsAggregation";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await dbConnect();

  const { id } = params;

  try {
    // Find and delete the URL from the URL collection
    const url = await Url.findOneAndDelete({
      _id: id,
      user: session.user.id
    });

    if (!url) {
      return NextResponse.json(
        { error: "URL not found or unauthorized" },
        { status: 404 }
      );
    }

    // Remove the URL's reference from the User collection
    await User.updateOne(
      { _id: session.user.id },
      { $pull: { urls: id } }
    );

    // Delete all related click data
    await Click.deleteMany({ url: id });

    // Delete all related analytics data
    await AnalyticsAggregation.deleteMany({ url: id });

    return NextResponse.json({
      message: "URL and related data deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting URL and related data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
