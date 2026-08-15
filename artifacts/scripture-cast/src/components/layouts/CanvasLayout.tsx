/**
 * CanvasLayout.tsx — ScriptureCast Canvas Layout
 *
 * Full-bleed canvas view with floating toolbar overlays, ruler/grid guides, and properties drawer.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CanvasLayoutProps {
  toolbar?: React.ReactNode;
  canvas: React.ReactNode;
  floatingControls?: React.ReactNode;
  drawer?: React.ReactNode;
  className?: string;
}

export function CanvasLayout({
  toolbar,
  canvas,
  floatingControls,
  drawer,
  className,
}: CanvasLayoutProps) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-neutral-950 flex flex-col", className)}>
      {toolbar && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-card/90 backdrop-blur border border-border/80 rounded-lg p-1.5 shadow-lg flex items-center gap-2">
          {toolbar}
        </div>
      )}
      <div className="flex-1 w-full h-full flex items-center justify-center relative overflow-auto p-8">
        {canvas}
      </div>
      {floatingControls && (
        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
          {floatingControls}
        </div>
      )}
      {drawer && <div className="absolute bottom-0 left-0 right-0 z-40">{drawer}</div>}
    </div>
  );
}
