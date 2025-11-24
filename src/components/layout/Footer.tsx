"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Newspaper, Calendar, Image, Users, Megaphone, Bell, FileText, Phone } from "lucide-react";

const footerLinks = {
  main: [
    { name: "Home", href: "/", icon: Home },
    { name: "Society's Updates", href: "/news", icon: Newspaper },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Gallery", href: "/gallery", icon: Image },
  ],
  about: [
    { name: "RWA", href: "/rwa", icon: Users },
    { name: "Advertisements", href: "/advertisements", icon: Megaphone },
    { name: "Policies and Documents", href: "/policies", icon: FileText },
  ],
  contact: [
    { name: "Quick Contact", href: "/quick-contact", icon: Phone },
    { name: "Contact Us", href: "/contact", icon: Phone },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ],
};

export function Footer() {
  return (
    <footer className="hidden lg:block bg-primary text-white mt-8">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-6 mb-6">
          {/* Main Navigation */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">Navigation</h3>
            <ul className="space-y-2">
              {footerLinks.main.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors flex items-start gap-1.5 leading-relaxed"
                  >
                    <link.icon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span className="break-words">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">About</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors flex items-start gap-1.5 leading-relaxed"
                  >
                    <link.icon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span className="break-words">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">Contact</h3>
            <ul className="space-y-2">
              {footerLinks.contact.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors flex items-start gap-1.5 leading-relaxed"
                  >
                    <link.icon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span className="break-words">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white">Greenwood City</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Block C Community Portal
              </p>
            </div>
            <div className="mt-auto pt-4">
              <p className="text-[10px] sm:text-xs text-gray-400">
                &copy; {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-primary/30 pt-4">
          <p className="text-center text-[10px] sm:text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Greenwood City Block C. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
