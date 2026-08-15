/**
 * AuthenticationLayout.tsx — ScriptureCast Authentication Layout
 *
 * Centered card container with branding header, ambient background gradients,
 * and dark-first church presentation identity for login & setup screens.
 */

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AuthenticationLayoutProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  logo?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthenticationLayout({
  title = "ScriptureCast",
  subtitle = "Church Presentation Platform",
  logo,
  children,
  footer,
  className,
}: AuthenticationLayoutProps) {
  return (
    <div className="min-h-screen w-screen bg-background text-foreground flex flex-col justify-between items-center p-4 relative overflow-hidden select-none">
      {/* Subtle ambient gradient overlay */}
      <div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md my-auto z-10">
        <div className="text-center space-y-2 mb-6">
          {logo && <div className="flex justify-center mb-3">{logo}</div>}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <Card className={cn("border-border/80 bg-card/90 backdrop-blur-lg shadow-xl", className)}>
          <CardContent className="pt-6">{children}</CardContent>
        </Card>

        {footer && <div className="text-center text-xs text-muted-foreground mt-6">{footer}</div>}
      </div>

      <footer className="py-3 text-[11px] text-muted-foreground/60 z-10">
        ScriptureCast V2 &bull; Church Presentation System
      </footer>
    </div>
  );
}
