/**
 * color-picker.tsx — ScriptureCast Color Picker Wrapper Component
 *
 * Accessible color input wrapper with hex input, color swatch preview, and preset colors.
 */

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  presets?: string[];
  className?: string;
}

const DEFAULT_PRESETS = [
  "#ffffff",
  "#f8fafc",
  "#cbd5e1",
  "#64748b",
  "#0f172a",
  "#e11d48",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
];

export function ColorPicker({
  value,
  onChange,
  label,
  presets = DEFAULT_PRESETS,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-xs font-medium text-muted-foreground">{label}</label>}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-9 w-9 rounded-md border border-border shrink-0 shadow-sm transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ backgroundColor: value || "#ffffff" }}
              aria-label="Pick color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value || "#ffffff"}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent"
                />
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-8 font-mono text-xs uppercase"
                  placeholder="#FFFFFF"
                />
              </div>

              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Presets</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onChange(preset)}
                      className={cn(
                        "h-6 w-6 rounded border border-white/20 transition-transform hover:scale-110 focus:outline-none",
                        value.toLowerCase() === preset.toLowerCase() && "ring-2 ring-primary",
                      )}
                      style={{ backgroundColor: preset }}
                      aria-label={`Select color ${preset}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs uppercase h-9"
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );
}
