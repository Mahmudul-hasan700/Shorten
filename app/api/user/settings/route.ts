// app/api/user/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findOne({
      email: session.user.email
    }).select("-password -apiKey");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { name, email, username } = data;

    await dbConnect();

    // Check if email or username is already taken
    const existingUser = await User.findOne({
      $or: [
        { email, _id: { $ne: session.user.id } },
        { username, _id: { $ne: session.user.id } }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or username already taken"
        },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name, email, username },
      { new: true }
    ).select("-password -apiKey");

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
