/**
 * inspector-panel.tsx — ScriptureCast Reusable Inspector Panel Component
 *
 * Tabbed or collapsible inspector panel for advanced presentation controls, song section switchers,
 * typography inspector, and theme overrides.
 */

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PropertyPanel } from "@/components/ui/property-panel";

export interface InspectorTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface InspectorPanelProps {
  title?: string;
  subtitle?: string;
  tabs: InspectorTab[];
  defaultTab?: string;
  className?: string;
}

export function InspectorPanel({
  title = "Inspector",
  subtitle = "Customize active selection",
  tabs,
  defaultTab,
  className,
}: InspectorPanelProps) {
  const activeDefault = defaultTab || tabs[0]?.id || "";

  return (
    <PropertyPanel title={title} subtitle={subtitle} className={className}>
      <Tabs defaultValue={activeDefault} className="w-full flex flex-col h-full">
        <TabsList className="w-full grid grid-cols-2 bg-muted/60 mb-3">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs flex items-center gap-1.5">
              {tab.icon}
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4 focus:outline-none">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </PropertyPanel>
  );
}
