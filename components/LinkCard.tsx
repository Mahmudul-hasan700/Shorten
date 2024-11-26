import { useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share, Trash, QrCode, BarChart2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
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

interface LinkCardProps {
  link: Url;
  onDelete: () => void;
}

export function LinkCard({ link, onDelete }: LinkCardProps) {
  const [showQR, setShowQR] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title || "Shared Link",
          text: link.description || "Check out this link!",
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert(
        `Share this link: ${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`
      );
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="mb-2 text-xl font-semibold">
          {link.title || "Untitled Link"}
        </h2>
        <p className="mb-2 text-sm text-gray-500">
          {link.description || "No description"}
        </p>
        <a
          href={`${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline">
          {`${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`}
        </a>
        <p className="mt-2 text-sm text-gray-500">
          Clicks: {link.clicks}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="icon" onClick={handleShare}>
          <Share className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onDelete}>
          <Trash className="h-4 w-4" />
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowQR(true)}>
              <QrCode className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>QR Code for your link</DialogTitle>
              <DialogDescription>
                Scan this QR code to open the shortened URL.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <QRCodeSVG
                value={`${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`}
                size={200}
              />
            </div>
          </DialogContent>
        </Dialog>
        <Link href={`/analytics/${link._id}`}>
          <Button variant="outline" size="icon">
            <BarChart2 className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
