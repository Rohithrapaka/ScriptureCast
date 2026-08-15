/**
 * top-navigation.tsx — ScriptureCast Top Navigation Component
 *
 * Header bar providing title, active status indicators, quick actions,
 * live presentation state toggle, and user profile slot.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TopNavigationProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode;
  center?: React.ReactNode;
  actions?: React.ReactNode;
}

export function TopNavigation({
  brand,
  center,
  actions,
  className,
  ...props
}: TopNavigationProps) {
  return (
    <header
      className={cn(
        "h-14 border-b border-border/80 bg-background/95 backdrop-blur-md px-4 flex items-center justify-between gap-4 shrink-0 z-40",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">{brand}</div>
      {center && <div className="hidden md:flex items-center justify-center flex-1 max-w-xl">{center}</div>}
      <div className="flex items-center gap-2 shrink-0">{actions}</div>
    </header>
  );
}
