/**
 * PresentationLayout.tsx — ScriptureCast Presentation Layout
 *
 * Optimized for the live /display and /control views.
 * Full-bleed black background for maximum stage contrast, minimal chrome,
 * and a floating presenter controller overlay.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PresentationLayoutProps {
  /** The main display area — fills entire viewport */
  stage: React.ReactNode;
  /** Floating presenter HUD overlay (slide counter, timer, notes preview) */
  overlay?: React.ReactNode;
  /** When true, hides all chrome for external display mode */
  fullDisplay?: boolean;
  className?: string;
}

export function PresentationLayout({
  stage,
  overlay,
  fullDisplay = false,
  className,
}: PresentationLayoutProps) {
  return (
    <div
      className={cn(
        "w-screen h-screen overflow-hidden bg-black flex items-center justify-center relative",
        className,
      )}
    >
      {/* Stage */}
      <div className="w-full h-full">{stage}</div>

      {/* Floating presenter HUD — hidden in fullDisplay mode */}
      {overlay && !fullDisplay && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50
            bg-black/70 backdrop-blur-md border border-white/10 rounded-xl
            px-4 py-2 flex items-center gap-4 shadow-2xl"
        >
          {overlay}
        </div>
      )}
    </div>
  );
}
