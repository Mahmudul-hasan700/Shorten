import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Url from "@/models/Url";
import User from "@/models/User";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await dbConnect();

  const { url, customAlias, title, description, tags, expiresAt } =
    await req.json();

  if (!url) {
    return NextResponse.json(
      { error: "URL is required" },
      { status: 400 }
    );
  }

  try {
    // Check user's quota
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.usageStats.remainingQuota <= 0) {
      return NextResponse.json(
        { error: "You have reached your monthly quota" },
        { status: 403 }
      );
    }

    // Ensure custom alias is unique
    if (customAlias) {
      const aliasExists = await Url.findOne({ customAlias });
      if (aliasExists) {
        return NextResponse.json(
          { error: "Custom alias is already in use" },
          { status: 409 }
        );
      }
    }

    // Create and save the new shortened URL
    const newUrl = new Url({
      originalUrl: url,
      shortCode: customAlias || nanoid(6),
      customAlias,
      user: session.user.id,
      title,
      description,
      tags,
      expiresAt
    });

    await newUrl.save();

    // Update user's usage stats
    user.usageStats.totalUrls += 1;
    user.usageStats.remainingQuota -= 1;
    await user.save();

    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${newUrl.shortCode}`;

    return NextResponse.json({
      id: newUrl._id,
      shortUrl,
      shortCode: newUrl.shortCode,
      customAlias: newUrl.customAlias,
      originalUrl: newUrl.originalUrl,
      expiresAt: newUrl.expiresAt,
      createdAt: newUrl.createdAt
    });
  } catch (error) {
    console.error("Error creating short URL:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          error:
            "Duplicate entry: custom alias or short code already exists"
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error creating short URL" },
      { status: 500 }
    );
  }
}
