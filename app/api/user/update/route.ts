import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, username, email, avatarUrl } = body;

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name, username, email, avatarUrl },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
