"use client";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import UrlShortenerForm from "@/components/UrlShortenerForm";

export default async function UrlShortenerPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <UrlShortenerForm />
      </div>
    </div>
  );
}
