// app/not-found/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Link Not Found</CardTitle>
          <CardDescription>
            The shortened URL you're trying to access doesn't exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This could be because:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
            <li>The link has expired</li>
            <li>The link was mistyped</li>
            <li>The link was deleted</li>
          </ul>
          <div className="mt-4">
            <Link
              href="/"
              className="text-sm text-primary hover:text-primary/90 underline-offset-4 hover:underline"
            >
              ← Return to Homepage
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
