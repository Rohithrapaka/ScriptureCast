/**
 * SplitPanelLayout.tsx — ScriptureCast Split Panel Layout
 *
 * Flexible 2-column or 2-row layout with resizable panel boundaries for dual-view tools.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SplitPanelLayoutProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  ratio?: "50/50" | "30/70" | "70/30" | "25/75";
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function SplitPanelLayout({
  primary,
  secondary,
  ratio = "50/50",
  orientation = "horizontal",
  className,
}: SplitPanelLayoutProps) {
  const ratioClasses = {
    "50/50": "grid-cols-1 md:grid-cols-2",
    "30/70": "grid-cols-1 md:grid-cols-[300px_1fr]",
    "70/30": "grid-cols-1 md:grid-cols-[1fr_300px]",
    "25/75": "grid-cols-1 md:grid-cols-[250px_1fr]",
  };

  return (
    <div
      className={cn(
        "w-full h-full grid gap-4 overflow-hidden",
        orientation === "horizontal" ? ratioClasses[ratio] : "grid-rows-2",
        className,
      )}
    >
      <div className="overflow-auto h-full w-full">{primary}</div>
      <div className="overflow-auto h-full w-full">{secondary}</div>
    </div>
  );
}
