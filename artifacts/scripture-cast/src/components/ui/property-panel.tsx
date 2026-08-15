/**
 * property-panel.tsx — ScriptureCast Reusable Property Panel Component
 *
 * Dedicated side panel component for editing properties, themes, layouts, or settings.
 */

import * as React from "react";
import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

export interface PropertyPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

export function PropertyPanel({
  title,
  subtitle,
  actions,
  children,
  width = "w-80",
  className,
  ...props
}: PropertyPanelProps) {
  return (
    <Panel
      variant="default"
      padding="md"
      className={cn(width, "shrink-0 h-full border-l border-border/80 rounded-none", className)}
      header={<SectionHeader title={title} subtitle={subtitle} actions={actions} className="border-none pb-0" />}
      {...props}
    >
      <div className="space-y-4 pt-2">{children}</div>
    </Panel>
  );
}
