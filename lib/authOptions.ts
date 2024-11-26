import type { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import dbConnect from "@/lib/mongodb";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { generateUniqueUsername } from "@/lib/generateUniqueUsername";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(dbConnect),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        await dbConnect();

        // Check if email already exists with a different provider
        const existingUser = await User.findOne({
          email: profile.email.toLowerCase()
        });

        if (existingUser && existingUser.provider !== "google") {
          throw new Error(
            `This email is already registered with ${existingUser.provider}. Please log in with ${existingUser.provider}.`
          );
        }

        // Generate username from email (first part before @)
        const emailUsername = profile.email
          .split("@")[0]
          .toLowerCase();

        // If user doesn't exist or is using google provider, create/update
        if (!existingUser) {
          // Generate a unique username
          const username =
            await generateUniqueUsername(emailUsername);

          const newUser = new User({
            name: profile.name,
            email: profile.email.toLowerCase(),
            username: username,
            avatarUrl: profile.picture,
            provider: "google",
            isVerified: true, // Google-authenticated users are considered verified
            role: "user"
          });

          await newUser.save();

          return {
            id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
            image: newUser.avatarUrl,
            role: newUser.role,
            username: newUser.username
          };
        } else {
          // Update existing Google user's details
          existingUser.name = profile.name;
          existingUser.avatarUrl = profile.picture;
          existingUser.lastLogin = new Date();
          await existingUser.save();

          return {
            id: existingUser._id.toString(),
            name: existingUser.name,
            email: existingUser.email,
            image: existingUser.avatarUrl,
            role: existingUser.role,
            username: existingUser.username
          };
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        try {
          await dbConnect();
          const user = await User.findOne({
            email: credentials.email.toLowerCase().trim()
          });

          // Check if user exists
          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Check if user registered with Google or another provider
          if (user.provider !== "email") {
            throw new Error(
              `This account was registered with ${user.provider}. Please use ${user.provider} to sign in.`
            );
          }

          // Ensure password exists for email provider
          if (!user.password) {
            throw new Error("Password not set for this account");
          }

          // Compare the provided password with the hashed password in the database
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatarUrl,
            role: user.role,
            username: user.username
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin"
  },
  secret: process.env.NEXTAUTH_SECRET
};
