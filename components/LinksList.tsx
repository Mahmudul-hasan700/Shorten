"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LinkCard } from "./LinkCard";
import { ObjectId } from "mongodb";
import { Loader2, PlusCircle } from "lucide-react";

interface Url {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  clicks: number;
  lastClickedAt?: Date;
}

export function LinksList() {
  const [links, setLinks] = useState<Url[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetchLinks();
    }
  }, [session]);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/urls");

      if (!response.ok) {
        throw new Error("Failed to fetch links");
      }

      const data: Url[] = await response.json();
      setLinks(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred"
      );
      setLinks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete link");
      }

      setLinks(links.filter(link => link._id.toString() !== id));
    } catch (err) {
      console.error("Delete error:", err);
      // Optionally show a toast or error message
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading your links...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="mb-4 text-xl font-semibold text-red-700">
          Oops! Something went wrong
        </h2>
        <p className="mb-4 text-red-600">{error}</p>
        <button
          onClick={fetchLinks}
          className="rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600">
          Try Again
        </button>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <div className="mb-6">
          <PlusCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-semibold text-gray-800">
            No Short URLs Found
          </h2>
          <p className="mb-6 text-gray-600">
            Create your first short URL to get started tracking and
            sharing links.
          </p>
        </div>
        <Link
          href="/create-new"
          className="inline-flex items-center space-x-2 rounded-md bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Short URL
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {links.map(link => (
          <LinkCard
            key={link._id.toString()}
            link={link}
            onDelete={() => handleDelete(link._id.toString())}
          />
        ))}
      </div>
      {links.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Total links: {links.length}
        </div>
      )}
    </div>
  );
}
