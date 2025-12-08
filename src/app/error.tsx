"use client";

import * as React from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Global error boundary for the App Router.
 *
 * This helps handle transient Next.js Server Actions issues in production
 * (e.g. "Failed to find Server Action" or "reading 'digest'") by
 * guiding the user to refresh the page instead of showing a blank error.
 */
export default function Error({ error, reset }: ErrorPageProps) {
  React.useEffect(() => {
    // Basic logging so we can correlate client-side errors with server logs
    // Do not leak sensitive data – only log the message and digest.
    // eslint-disable-next-line no-console
    console.error("App error boundary:", {
      message: error?.message,
      name: error?.name,
      digest: (error as { digest?: string }).digest,
    });
  }, [error]);

  const isServerActionVersionSkew =
    typeof error?.message === "string" &&
    (error.message.includes("Failed to find Server Action") ||
      error.message.includes("reading 'digest'"));

  const title = isServerActionVersionSkew
    ? "The app was just updated"
    : "Something went wrong";

  const description = isServerActionVersionSkew
    ? "It looks like the website was updated while this page was open. Please refresh the page to continue."
    : "An unexpected error occurred. You can try again or go back to the home page.";

  const handleRetry = () => {
    if (isServerActionVersionSkew) {
      // Hard reload to ensure client and server are on the same build
      if (typeof window !== "undefined") {
        window.location.reload();
        return;
      }
    }
    // For other errors, let Next.js attempt to re-render
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950/95 text-slate-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          {description}
        </p>

        {process.env.NODE_ENV === "development" && error?.message ? (
          <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-950/80 px-3 py-2 text-xs text-red-200 border border-red-900/60">
            {error.message}
          </pre>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors"
          >
            {isServerActionVersionSkew ? "Refresh now" : "Try again"}
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors"
          >
            Go to homepage
          </a>
        </div>
      </div>
    </div>
  );
}