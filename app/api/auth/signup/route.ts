// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import sharp from "sharp";

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

interface SignupResponse {
  message?: string;
  error?: string;
}

async function generateGradientAvatar(name: string): Promise<Buffer> {
  const svg = `
    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${Math.random() * 360},100%,50%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(${Math.random() * 360},100%,50%);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        fill="white" 
        font-size="48px" 
        font-family="Arial"
      >${name.charAt(0).toUpperCase()}</text>
    </svg>
  `;

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

async function generateUniqueUsername(base: string): Promise<string> {
  const sanitizedBase = base.toLowerCase().replace(/[^a-z0-9]/g, "");
  let username = sanitizedBase;
  let count = 0;

  while (await User.findOne({ username })) {
    count += 1;
    username = `${sanitizedBase}${count}`;
  }

  return username;
}

async function uploadAvatar(
  buffer: Buffer,
  username: string
): Promise<string> {
  try {
    const fileName = `avatars/${username}-${Date.now()}.png`;
    const avatarRef = ref(storage, fileName);
    const snapshot = await uploadBytes(avatarRef, buffer);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error("Avatar upload error:", error);
    throw new Error("Failed to upload avatar");
  }
}

export async function POST(
  req: Request
): Promise<NextResponse<SignupResponse>> {
  try {
    const data: SignupRequest = await req.json();
    const { name, email, password } = data;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Generate username and avatar
    const baseUsername = email.split("@")[0];
    const username = await generateUniqueUsername(baseUsername);
    const avatarBuffer = await generateGradientAvatar(name);
    const avatarUrl = await uploadAvatar(avatarBuffer, username);

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create user
    const newUser = new User({
      name: name.trim(),
      username,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      avatarUrl,
      createdAt: new Date()
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
