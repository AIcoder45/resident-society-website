import * as React from "react";

export function Footer() {
  return (
    <footer className="hidden lg:block bg-primary text-white mt-8">
      <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
        {/* Copyright Only */}
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-gray-300">
            &copy; {new Date().getFullYear()} Greenwood City Block C. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
