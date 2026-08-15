/**
 * InspectorLayout.tsx — ScriptureCast Inspector Layout
 *
 * Side-by-side workspace with main content on the left and sticky inspector panel on the right.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InspectorLayoutProps {
  children: React.ReactNode;
  inspector: React.ReactNode;
  inspectorWidth?: string;
  className?: string;
}

export function InspectorLayout({
  children,
  inspector,
  inspectorWidth = "w-80",
  className,
}: InspectorLayoutProps) {
  return (
    <div className={cn("w-full h-full flex overflow-hidden", className)}>
      <div className="flex-1 overflow-auto p-4">{children}</div>
      <aside className={cn(inspectorWidth, "shrink-0 border-l border-border/80 bg-card/60 overflow-y-auto")}>
        {inspector}
      </aside>
    </div>
  );
}
