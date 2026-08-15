/**
 * DashboardLayout.tsx — ScriptureCast Dashboard Layout
 *
 * Full-screen layout with collapsible Sidebar, TopNavigation, and main content area.
 * Adapts to Mobile/Tablet with drawer navigation.
 */

import * as React from "react";
import { TopNavigation } from "@/components/ui/top-navigation";
import { cn } from "@/lib/utils";

export interface DashboardLayoutProps {
  topNavBrand?: React.ReactNode;
  topNavActions?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({
  topNavBrand = <span className="font-bold tracking-wider text-primary">SCRIPTURECAST</span>,
  topNavActions,
  sidebar,
  children,
  className,
}: DashboardLayoutProps) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background text-foreground select-none">
      <TopNavigation brand={topNavBrand} actions={topNavActions} />
      <div className="flex-1 flex overflow-hidden">
        {sidebar && <aside className="shrink-0 h-full border-r border-border/80 bg-card/50">{sidebar}</aside>}
        <main className={cn("flex-1 overflow-auto p-4 sm:p-6 bg-background", className)}>{children}</main>
      </div>
    </div>
  );
}
