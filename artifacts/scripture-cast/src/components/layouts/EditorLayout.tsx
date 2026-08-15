/**
 * EditorLayout.tsx — ScriptureCast Editor Layout
 *
 * 3-Column workspace for presentation creation, slide editing, song editing, or scripture selection.
 * Left: Navigation/Items List | Center: Live Stage Preview | Right: Inspector / Controls.
 */

import * as React from "react";
import { TopNavigation } from "@/components/ui/top-navigation";
import { cn } from "@/lib/utils";

export interface EditorLayoutProps {
  topNavBrand?: React.ReactNode;
  topNavCenter?: React.ReactNode;
  topNavActions?: React.ReactNode;
  leftPanel?: React.ReactNode;
  centerStage: React.ReactNode;
  rightInspector?: React.ReactNode;
  className?: string;
}

export function EditorLayout({
  topNavBrand,
  topNavCenter,
  topNavActions,
  leftPanel,
  centerStage,
  rightInspector,
  className,
}: EditorLayoutProps) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background text-foreground">
      <TopNavigation brand={topNavBrand} center={topNavCenter} actions={topNavActions} />
      <div className={cn("flex-1 flex overflow-hidden", className)}>
        {leftPanel && <div className="w-80 shrink-0 border-r border-border/80 bg-card/40 flex flex-col overflow-hidden">{leftPanel}</div>}
        <main className="flex-1 overflow-auto bg-black/60 flex items-center justify-center p-4 relative">{centerStage}</main>
        {rightInspector && <div className="w-80 shrink-0 border-l border-border/80 bg-card/40 flex flex-col overflow-hidden">{rightInspector}</div>}
      </div>
    </div>
  );
}
