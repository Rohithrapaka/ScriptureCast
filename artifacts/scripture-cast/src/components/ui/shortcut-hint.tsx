/**
 * shortcut-hint.tsx — ScriptureCast Keyboard Shortcut Hint Component
 *
 * Displays formatted hotkeys like `Ctrl + K`, `Space`, `1-9`, `B` for presenter speed.
 */

import * as React from "react";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

export interface ShortcutHintProps {
  keys: string[];
  label?: string;
  className?: string;
}

export function ShortcutHint({ keys, label, className }: ShortcutHintProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {label && <span className="text-xs text-muted-foreground mr-1">{label}</span>}
      {keys.map((key, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="text-xs text-muted-foreground/60">+</span>}
          <Kbd>{key}</Kbd>
        </React.Fragment>
      ))}
    </div>
  );
}
