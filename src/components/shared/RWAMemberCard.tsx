"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RWAMember } from "@/types";

export interface RWAMemberCardProps {
  member: RWAMember;
  index?: number;
  className?: string;
}

/**
 * RWA Member Card Component
 * Displays RWA governing body member with photo, name, position, and message
 */
export function RWAMemberCard({
  member,
  index = 0,
  className,
}: RWAMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn("w-full min-w-0", className)}
    >
      <Card className="h-full w-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
        {/* Photo Section */}
        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-primary/10">
              <div className="text-4xl font-bold text-primary">
                {member.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-text mb-2">{member.name}</h3>
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">
              {member.position}
            </p>
          </div>
          
          {member.message && (
            <p className="text-sm text-text-light leading-relaxed flex-1">
              {member.message}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

