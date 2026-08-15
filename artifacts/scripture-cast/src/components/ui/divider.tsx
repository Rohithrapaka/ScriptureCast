/**
 * divider.tsx — ScriptureCast Divider Component
 *
 * Re-exports and wraps Separator primitive for clean vertical/horizontal spacing.
 */

import * as React from "react";
import { Separator } from "@/components/ui/separator";

export interface DividerProps extends React.ComponentPropsWithoutRef<typeof Separator> {
  label?: React.ReactNode;
}

export function Divider({ label, className, orientation = "horizontal", ...props }: DividerProps) {
  if (!label || orientation === "vertical") {
    return <Separator orientation={orientation} className={className} {...props} />;
  }

  return (
    <div className="relative flex py-2 items-center w-full">
      <div className="flex-grow border-t border-border/80"></div>
      <span className="flex-shrink mx-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-grow border-t border-border/80"></div>
    </div>
  );
}
