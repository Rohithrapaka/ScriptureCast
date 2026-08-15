/**
 * MobileLayout.tsx — ScriptureCast Mobile Layout
 *
 * Touch-first layout with top bar, bottom navigation tab bar, and scrollable view for phones/tablets.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MobileTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface MobileLayoutProps {
  header?: React.ReactNode;
  tabs?: MobileTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function MobileLayout({
  header,
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
}: MobileLayoutProps) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background text-foreground">
      {header && <header className="h-12 border-b border-border/80 px-3 flex items-center justify-between shrink-0 bg-card">{header}</header>}
      <main className={cn("flex-1 overflow-auto p-3 pb-16", className)}>{children}</main>
      {tabs && tabs.length > 0 && (
        <nav className="fixed bottom-0 left-0 right-0 h-14 bg-card/95 backdrop-blur border-t border-border/80 flex items-center justify-around z-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs font-medium transition-colors",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
