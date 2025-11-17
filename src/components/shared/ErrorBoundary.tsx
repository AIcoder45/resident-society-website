"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Error Boundary Component
 * Catches React errors and displays user-friendly error messages
 * Provides retry and navigation options
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-error/10 p-4">
                <AlertCircle className="h-12 w-12 text-error" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text">
                Something went wrong
              </h1>
              <p className="text-base text-text-light line-height-1.5">
                We encountered an unexpected error. Please try again or return to the home page.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={this.handleReset}
                className="w-full touch-target tap-feedback"
                size="default"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="w-full touch-target tap-feedback"
                size="default"
              >
                <Home className="h-5 w-5 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-text-light cursor-pointer touch-target">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-text-light bg-background-dark p-4 rounded-lg overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

