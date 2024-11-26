import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Url from "@/models/Url";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await dbConnect();

  const urls = await Url.find({ user: session.user.id }).sort({
    createdAt: -1
  });

  return NextResponse.json(urls);
}
