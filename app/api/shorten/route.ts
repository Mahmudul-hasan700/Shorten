import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Url from "@/models/Url";
import User from "@/models/User";
import { z } from "zod";

// Zod validation schema
const urlSchema = z.object({
  originalUrl: z.string().url({ message: "Invalid URL format" }),
  customAlias: z
    .string()
    .optional()
    .refine(
      val =>
        val === undefined || (val.length >= 3 && val.length <= 30),
      { message: "Custom alias must be 3-30 characters long" }
    )
    .refine(
      val => val === undefined || /^[a-zA-Z0-9-_]+$/.test(val),
      {
        message:
          "Custom alias can only contain alphanumeric characters, hyphens, and underscores"
      }
    )
});

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = urlSchema.parse(body);

    // Find the current user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check user's URL quota
    if (user.usageStats.remainingQuota <= 0) {
      return NextResponse.json(
        { message: "Monthly URL creation quota exceeded" },
        { status: 403 }
      );
    }

    // Check if custom alias already exists
    if (validatedData.customAlias) {
      const existingAlias = await Url.findOne({
        $or: [
          { shortCode: validatedData.customAlias },
          { customAlias: validatedData.customAlias }
        ]
      });

      if (existingAlias) {
        return NextResponse.json(
          { message: "Custom alias already in use" },
          { status: 400 }
        );
      }
    }

    // Create new URL entry
    const newUrl = new Url({
      originalUrl: validatedData.originalUrl,
      user: user._id,
      ...(validatedData.customAlias && {
        shortCode: validatedData.customAlias,
        customAlias: validatedData.customAlias
      }),
      status: "active"
    });

    // Save the URL
    await newUrl.save();

    // Update user's usage stats
    user.usageStats.totalUrls += 1;
    user.usageStats.remainingQuota -= 1;
    user.urls.push(newUrl._id);
    await user.save();

    // Return the shortened URL details
    return NextResponse.json(
      {
        shortCode: newUrl.shortCode,
        originalUrl: newUrl.originalUrl,
        title: newUrl.title
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("URL shortening error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation Error",
          errors: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "An error occurred while shortening the URL",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
