import type { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import dbConnect from "@/lib/mongodb";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(dbConnect),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
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

          if (!user || !user.password) {
            throw new Error("Invalid email or password");
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
            role: user.role
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
      }
      return session;
    }
  },

  pages: {
    signIn: "/auth/signin"
  },

  secret: process.env.NEXTAUTH_SECRET
};
