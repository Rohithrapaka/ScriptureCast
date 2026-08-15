/**
 * section-header.tsx — ScriptureCast Section Header Component
 *
 * Section titles with optional subtitles, actions, and badges for panels and modules.
 */

import * as React from "react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actions,
  badge,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 pb-3 border-b border-border/60", className)}>
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          {typeof title === "string" ? (
            <Typography variant="h4" className="truncate">
              {title}
            </Typography>
          ) : (
            title
          )}
          {badge}
        </div>
        {subtitle && (
          typeof subtitle === "string" ? (
            <Typography variant="caption" className="text-muted-foreground truncate">
              {subtitle}
            </Typography>
          ) : (
            subtitle
          )
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
