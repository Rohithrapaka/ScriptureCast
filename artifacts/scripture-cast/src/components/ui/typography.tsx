/**
 * typography.tsx — ScriptureCast Typography Component
 *
 * Typography presets supporting Display, H1-H4, Body (Large/Default/Small),
 * Caption, Label, and Mono presets with automatic Telugu / English font adaptation.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { isTeluguText } from "@/lib/design-tokens";

const typographyVariants = cva(
  "transition-colors duration-150 text-foreground",
  {
    variants: {
      variant: {
        display: "text-4xl sm:text-5xl font-bold tracking-tight leading-none",
        h1: "text-3xl sm:text-4xl font-bold tracking-tight leading-tight",
        h2: "text-2xl sm:text-3xl font-semibold tracking-tight leading-snug",
        h3: "text-xl sm:text-2xl font-semibold leading-snug",
        h4: "text-lg font-semibold leading-snug",
        "body-large": "text-lg font-normal leading-relaxed",
        body: "text-base font-normal leading-normal",
        "body-small": "text-sm font-normal leading-normal",
        caption: "text-xs font-normal leading-normal text-muted-foreground",
        label: "text-sm font-medium leading-none tracking-wide",
        mono: "font-mono text-xs sm:text-sm tracking-normal bg-muted/40 px-1.5 py-0.5 rounded border border-border/50",
      },
      color: {
        default: "text-foreground",
        primary: "text-primary",
        secondary: "text-muted-foreground",
        muted: "text-muted-foreground/80",
        danger: "text-destructive",
        success: "text-emerald-400",
        warning: "text-amber-400",
        accent: "text-primary font-medium",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
      },
    },
    defaultVariants: {
      variant: "body",
      color: "default",
      align: "left",
    },
  },
);

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
  children?: React.ReactNode;
  autoDetectTelugu?: boolean;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      className,
      variant = "body",
      color,
      align,
      as,
      children,
      autoDetectTelugu = true,
      ...props
    },
    ref,
  ) => {
    // Default element mapping based on variant
    const defaultTagMap: Record<string, React.ElementType> = {
      display: "h1",
      h1: "h1",
      h2: "h2",
      h3: "h3",
      h4: "h4",
      "body-large": "p",
      body: "p",
      "body-small": "p",
      caption: "span",
      label: "label",
      mono: "code",
    };

    const Component = as || defaultTagMap[variant || "body"] || "p";

    // Detect Telugu text if string child or string array
    const textContent =
      typeof children === "string"
        ? children
        : Array.isArray(children)
        ? children.filter((c) => typeof c === "string").join(" ")
        : "";

    const isTelugu = autoDetectTelugu && textContent && isTeluguText(textContent);

    return (
      <Component
        ref={ref as any}
        className={cn(
          typographyVariants({ variant, color, align }),
          isTelugu ? "font-['Noto_Sans_Telugu']" : "font-sans",
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Typography.displayName = "Typography";
