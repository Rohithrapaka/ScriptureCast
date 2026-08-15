/**
 * panel.tsx — ScriptureCast Panel Component
 *
 * Dark-first container for grouped content, sidebars, tools, or inspector panels.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const panelVariants = cva(
  "rounded-lg border transition-colors flex flex-col overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-card border-border/80 text-card-foreground shadow-sm",
        subtle: "bg-background/60 border-border/40 text-foreground",
        elevated: "bg-card border-border shadow-md",
        glass: "bg-card/70 backdrop-blur-md border-border/50 text-card-foreground",
        dark: "bg-black/40 border-white/10 text-white",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4 sm:p-5",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

export interface PanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof panelVariants> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant, padding, header, footer, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(panelVariants({ variant, padding }), className)} {...props}>
        {header && (
          <div className="border-b border-border/60 pb-3 mb-3 shrink-0 flex items-center justify-between">
            {header}
          </div>
        )}
        <div className="flex-1 overflow-auto">{children}</div>
        {footer && (
          <div className="border-t border-border/60 pt-3 mt-3 shrink-0 flex items-center justify-between">
            {footer}
          </div>
        )}
      </div>
    );
  },
);

Panel.displayName = "Panel";
