"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MaintenancePageProps {
  onRetry?: () => void;
}

/**
 * Maintenance Page Component
 * Displayed when Strapi API is unavailable after retries
 */
export function MaintenancePage({ onRetry }: MaintenancePageProps) {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Try to reload the page
      if (onRetry) {
        await onRetry();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-background to-gray-50/50">
      <Card className="max-w-md w-full border border-gray-200/60 shadow-lg">
        <CardContent className="p-6 sm:p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-4">
              <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-text">
              Under Maintenance
            </h1>
            <p className="text-sm sm:text-base text-text-light leading-relaxed">
              We&apos;re currently experiencing technical difficulties. Our content management system is temporarily unavailable.
            </p>
          </div>

          {/* Details */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-left">
            <p className="text-xs sm:text-sm text-text-light mb-2">
              <strong>What happened?</strong>
            </p>
            <p className="text-xs sm:text-sm text-text-light">
              We couldn&apos;t connect to our content server after multiple attempts. This is usually temporary and should be resolved shortly.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full pt-2">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full touch-target tap-feedback"
              size="lg"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Try Again
                </>
              )}
            </Button>
            <Button
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="w-full touch-target tap-feedback"
              size="lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-text-light/60 pt-2">
            If this issue persists, please contact support or try again later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

