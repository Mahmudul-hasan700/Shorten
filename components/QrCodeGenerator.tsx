"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function QrCodeGenerator() {
  const [url, setUrl] = useState("");
  const [qrCode, setQrCode] = useState("");

  const generateQrCode = () => {
    setQrCode(url);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">QR Code Generator</h2>
      <div className="flex space-x-4 mb-4">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL for QR code"
        />
        <Button onClick={generateQrCode}>Generate QR Code</Button>
      </div>
      {qrCode && (
        <div className="mt-4">
          <QRCodeSVG value={qrCode} size={200} />
        </div>
      )}
    </div>
  );
}
