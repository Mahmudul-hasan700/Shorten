"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function UrlShortenerForm() {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url,
          customAlias,
          title,
          description,
          tags: tags.split(",").map(tag => tag.trim()),
          expiresAt: expiresAt
            ? new Date(expiresAt).toISOString()
            : undefined
        })
      });

      const data = await response.json();
      if (response.ok) {
        setShortUrl(data.shortUrl);
        toast.success(
          "Your short URL has been generated successfully."
        );
      } else {
        toast.error(
          data.error || "An error occurred while shortening the URL."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="url">URL to shorten</Label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Enter your URL here"
          required
        />
      </div>
      <div>
        <Label htmlFor="customAlias">Custom Alias (optional)</Label>
        <Input
          id="customAlias"
          type="text"
          value={customAlias}
          onChange={e => setCustomAlias(e.target.value)}
          placeholder="Enter custom alias"
        />
      </div>
      <div>
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter title"
        />
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter description"
        />
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
        <Input
          id="tags"
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Enter tags"
        />
      </div>
      <div>
        <Label htmlFor="expiresAt">Expiration Date (optional)</Label>
        <Input
          id="expiresAt"
          type="datetime-local"
          value={expiresAt}
          onChange={e => setExpiresAt(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
            Shortening...
          </>
        ) : (
          "Shorten URL"
        )}
      </Button>
      {shortUrl && (
        <div className="mt-4 rounded-md bg-green-100 p-4">
          <p className="font-semibold">Your shortened URL:</p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline">
            {shortUrl}
          </a>
        </div>
      )}
    </form>
  );
}
