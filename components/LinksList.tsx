"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LinkCard } from "./LinkCard";
import { ObjectId } from "mongodb";

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
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetchLinks();
    }
  }, [session]);

  const fetchLinks = async () => {
    const response = await fetch("/api/urls");
    if (response.ok) {
      const data: Url[] = await response.json();
      setLinks(data);
    }
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/urls/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setLinks(links.filter(link => link._id.toString() !== id));
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {links.map(link => (
        <LinkCard
          key={link._id.toString()}
          link={link}
          onDelete={() => handleDelete(link._id.toString())}
        />
      ))}
    </div>
  );
}