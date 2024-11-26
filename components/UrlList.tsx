"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface UrlData {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
}

export function UrlList() {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetchUrls();
    }
  }, [session]);

  const fetchUrls = async () => {
    const response = await fetch("/api/urls");
    if (response.ok) {
      const data = await response.json();
      setUrls(data);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">
        Your Shortened URLs
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Original URL</TableHead>
            <TableHead>Short URL</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map(url => (
            <TableRow key={url._id}>
              <TableCell className="font-medium">
                {url.originalUrl}
              </TableCell>
              <TableCell>
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline">
                  {`${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`}
                </a>
              </TableCell>
              <TableCell>{url.clicks}</TableCell>
              <TableCell>
                {new Date(url.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
