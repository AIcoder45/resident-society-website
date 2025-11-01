"use client";

import * as React from "react";
import QRCode from "react-qr-code";
import { QrCode, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface QRCodeShareProps {
  url: string;
  title?: string;
}

/**
 * QR Code Share Component
 * Displays a QR code that can be scanned to share the page URL
 * Supports downloading the QR code as an image
 */
export function QRCodeShare({ url, title }: QRCodeShareProps) {
  const [fullUrl, setFullUrl] = React.useState<string>("");
  const qrRef = React.useRef<HTMLDivElement>(null);

  // Get full URL on client side
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // If url is already a full URL, use it; otherwise construct from current origin
      const isFullUrl = url.startsWith("http://") || url.startsWith("https://");
      const finalUrl = isFullUrl ? url : `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
      setFullUrl(finalUrl);
    }
  }, [url]);

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    // Get the SVG element
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    // Convert SVG to canvas then to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `qrcode-${title ? title.toLowerCase().replace(/\s+/g, "-") : "policy"}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }, "image/png");
      }
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <QrCode className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-text">
              Share this Policy
            </h3>
          </div>
          
          <p className="text-sm text-text-light max-w-md">
            Scan this QR code to quickly access this policy document on your mobile device.
          </p>

          {fullUrl ? (
            <div
              ref={qrRef}
              className="bg-white p-4 rounded-lg shadow-sm"
              style={{ display: "inline-block" }}
            >
              <QRCode
                value={fullUrl}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
              />
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-sm w-[200px] h-[200px] flex items-center justify-center">
              <div className="text-text-light">Loading QR Code...</div>
            </div>
          )}

          <Button
            onClick={downloadQRCode}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>

          <p className="text-xs text-text-light mt-2">
            The QR code can be included in PDF documents for easy sharing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

