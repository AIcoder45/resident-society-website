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
            link.download = `qrcode-${title ? title.toLowerCase().replace(/\s+/g, "-") : "page"}.png`;
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
      <CardContent className="p-2 sm:p-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* QR Code Section */}
          <div className="flex flex-col items-center flex-shrink-0">
            {fullUrl ? (
              <div
                ref={qrRef}
                className="bg-white p-1 rounded border border-gray-200"
                style={{ display: "inline-block" }}
              >
                <QRCode
                  value={fullUrl}
                  size={70}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox="0 0 256 256"
                />
              </div>
            ) : (
              <div className="bg-white p-1 rounded border border-gray-200 w-[70px] h-[70px] flex items-center justify-center">
                <div className="text-[7px] text-text-light text-center">Loading...</div>
              </div>
            )}
            <Button
              onClick={downloadQRCode}
              variant="outline"
              size="sm"
              className="mt-1 text-[9px] h-5 px-1.5 py-0 border-green-600 text-green-600 hover:bg-green-50"
            >
              <Download className="h-2.5 w-2.5 mr-0.5" />
              Download
            </Button>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <QrCode className="h-3 w-3 text-primary flex-shrink-0" />
              <h3 className="text-[10px] sm:text-xs font-semibold text-text">
                Share this Document
              </h3>
            </div>
            <p className="text-[8px] sm:text-[9px] text-text-light leading-tight mb-1.5">
              Scan QR code to access on mobile device.
            </p>
            <div className="flex flex-wrap gap-1">
              <div className="text-[7px] sm:text-[8px] text-text-light bg-gray-50 px-1 py-0.5 rounded">
                📱 Mobile
              </div>
              <div className="text-[7px] sm:text-[8px] text-text-light bg-gray-50 px-1 py-0.5 rounded">
                🔗 Quick
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

