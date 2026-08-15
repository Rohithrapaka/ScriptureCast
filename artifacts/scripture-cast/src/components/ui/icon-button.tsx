/**
 * icon-button.tsx — ScriptureCast Icon Button Component
 *
 * Dedicated button for standalone icon actions with tooltips, touch-friendly sizes,
 * and keyboard accessibility.
 */

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends Omit<ButtonProps, "children"> {
  icon: React.ReactNode;
  label: string;               // Required for screen reader aria-label
  tooltip?: string;            // Optional tooltip on hover
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      tooltip,
      tooltipSide = "top",
      size = "icon",
      variant = "ghost",
      className,
      ...props
    },
    ref,
  ) => {
    const btn = (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        aria-label={label}
        className={cn("shrink-0 touch-manipulation", className)}
        {...props}
      >
        {icon}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return btn;
  },
);

IconButton.displayName = "IconButton";
