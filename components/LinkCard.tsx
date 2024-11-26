import { useState } from "react";
import Link from "next/link";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle
} from "@headlessui/react";
import { Share, Trash, QrCode, BarChart2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ObjectId } from "mongodb";
import { toast } from "react-hot-toast";

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
  const [isQROpen, setIsQROpen] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: link.title || "Shared Link",
          text: link.description || "Check out this link!",
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to share link");
      }
    }
  

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
      <div className="p-6">
        <h2 className="mb-2 truncate text-2xl font-bold text-gray-800 dark:text-gray-100">
          {link.title || "Untitled Link"}
        </h2>
        <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {link.description || "No description provided"}
        </p>

        <div className="mb-4 rounded-md bg-gray-50 p-3 dark:bg-gray-700">
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            {`${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`}
          </a>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Clicks: {link.clicks}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Created: {new Date(link.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={handleShare}
            className="rounded-full p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Share link">
            <Share className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={onDelete}
            className="rounded-full p-2 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-800 dark:hover:text-red-400"
            aria-label="Delete link">
            <Trash className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => setIsQROpen(true)}
            className="rounded-full p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Show QR Code">
            <QrCode className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <Link
            href={`/analytics/${link._id}`}
            className="rounded-full p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="View Analytics">
            <BarChart2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
        </div>
      </div>

      <Dialog
        open={isQROpen}
        onClose={() => setIsQROpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <div className="relative mx-auto w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
          <button
            onClick={() => setIsQROpen(false)}
            className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close QR Code">
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <DialogTitle className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
            QR Code
          </DialogTitle>

          <Description className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Scan this QR code to open the shortened URL
          </Description>

          <div className="flex justify-center rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <QRCodeSVG
              value={`${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`}
              size={200}
              className="shadow-md"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}