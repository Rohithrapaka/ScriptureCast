/**
 * form-row.tsx — ScriptureCast Reusable Form Row Component
 *
 * Standardized form layout row with label, optional help text, error message, and input field.
 */

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormRowProps {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean;
}

export function FormRow({
  label,
  htmlFor,
  required,
  helpText,
  error,
  children,
  className,
  horizontal = false,
}: FormRowProps) {
  return (
    <div
      className={cn(
        horizontal ? "sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center space-y-1 sm:space-y-0" : "space-y-1.5",
        className,
      )}
    >
      {label && (
        <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className={horizontal ? "sm:col-span-2 space-y-1" : "space-y-1"}>
        {children}
        {helpText && !error && <p className="text-[11px] text-muted-foreground">{helpText}</p>}
        {error && <p className="text-[11px] text-destructive font-medium">{error}</p>}
      </div>
    </div>
  );
}
