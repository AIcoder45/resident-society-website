import * as React from "react";
import Link from "next/link";
import { Mail, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white mt-20">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-sm text-gray-300 mb-4">
              Building a stronger community together. Stay connected and informed.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors touch-target tap-feedback"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors touch-target tap-feedback"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors touch-target tap-feedback"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
                  News
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/quick-contact" className="text-gray-300 hover:text-white transition-colors">
                  Quick Contact
                </Link>
              </li>
              <li>
                <Link href="/policies" className="text-gray-300 hover:text-white transition-colors">
                  Policies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/contact"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-light pt-8 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} Greenwood City Block C. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
