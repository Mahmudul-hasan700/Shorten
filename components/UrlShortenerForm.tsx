"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Copy, Link } from "lucide-react";

// Updated Zod validation schema
const urlSchema = z.object({
  originalUrl: z.string().url({ message: "Invalid URL format" }),
  customAlias: z
    .string()
    .optional()
    .refine(
      val =>
        val === undefined ||
        val.trim() === "" ||
        (val.length >= 3 && val.length <= 30),
      { message: "Custom alias must be 3-30 characters long" }
    )
    .refine(
      val =>
        val === undefined ||
        val.trim() === "" ||
        /^[a-z0-9-_]+$/.test(val),
      {
        message:
          "Custom alias can only contain lowercase alphanumeric characters, hyphens, and underscores"
      }
    )
    .transform(val => val?.trim() || undefined)
});

export default function UrlShortenerForm() {
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      originalUrl: "",
      customAlias: ""
    }
  });

  const onSubmit = async (data: z.infer<typeof urlSchema>) => {
    setIsLoading(true);
    setShortenedUrl("");

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          originalUrl: data.originalUrl,
          ...(data.customAlias && { customAlias: data.customAlias })
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "URL shortening failed");
      }

      const result = await response.json();

      // Construct full shortened URL
      const fullShortenedUrl = `${window.location.origin}/${result.shortCode}`;
      setShortenedUrl(fullShortenedUrl);

      toast.success("Your link is ready to be shared!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl);
      toast.success("Shortened URL copied to clipboard");
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link /> Shorten Your URL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4">
            <FormField
              control={form.control}
              name="originalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the full URL you want to shorten
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customAlias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Alias (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="my-custom-link"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Create a custom short link (3-30 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}>
              {isLoading ? "Shortening..." : "Shorten URL"}
            </Button>
          </form>
        </Form>

        {shortenedUrl && (
          <div className="mt-4 flex items-center space-x-2">
            <Input
              value={shortenedUrl}
              readOnly
              className="flex-grow"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
