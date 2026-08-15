/**
 * design-tokens.ts — ScriptureCast V2 Design Token System
 *
 * Centralized design tokens for dark-first, accessible, church presentation UI.
 * All components & layouts draw their values from these tokens or equivalent CSS variables.
 */

import { useState, useEffect } from "react";

// ── 1. Color Palette Tokens ───────────────────────────────────────────────────

export const colorTokens = {
  // Brand & Accent
  primary: {
    DEFAULT: "hsl(35, 90%, 50%)",      // Warm Amber / Gold
    foreground: "hsl(0, 0%, 10%)",
    hover: "hsl(35, 95%, 45%)",
    active: "hsl(35, 95%, 40%)",
    subtle: "hsla(35, 90%, 50%, 0.15)",
    border: "hsla(35, 90%, 50%, 0.3)",
  },
  secondary: {
    DEFAULT: "hsl(220, 15%, 15%)",     // Deep Slate
    foreground: "hsl(220, 15%, 95%)",
    hover: "hsl(220, 15%, 20%)",
    active: "hsl(220, 15%, 25%)",
  },
  accent: {
    DEFAULT: "hsl(35, 90%, 50%)",
    foreground: "hsl(0, 0%, 10%)",
  },

  // State colors
  danger: {
    DEFAULT: "hsl(0, 84%, 60%)",
    foreground: "hsl(0, 0%, 100%)",
    subtle: "hsla(0, 84%, 60%, 0.15)",
    border: "hsla(0, 84%, 60%, 0.3)",
  },
  warning: {
    DEFAULT: "hsl(38, 92%, 50%)",
    foreground: "hsl(0, 0%, 10%)",
    subtle: "hsla(38, 92%, 50%, 0.15)",
  },
  success: {
    DEFAULT: "hsl(142, 71%, 45%)",
    foreground: "hsl(0, 0%, 100%)",
    subtle: "hsla(142, 71%, 45%, 0.15)",
  },
  info: {
    DEFAULT: "hsl(217, 91%, 60%)",
    foreground: "hsl(0, 0%, 100%)",
    subtle: "hsla(217, 91%, 60%, 0.15)",
  },

  // Dark-first surface & elevation hierarchy
  background: {
    base: "hsl(220, 15%, 4%)",          // L0: App Root / Backdrop
    surface: "hsl(220, 15%, 7%)",       // L1: Primary Containers / Sidebar
    card: "hsl(220, 15%, 10%)",         // L2: Cards, Panels, Rows
    popover: "hsl(220, 15%, 12%)",      // L3: Modals, Menus, Tooltips
    overlay: "rgba(0, 0, 0, 0.75)",     // Dialog Backdrop
  },

  // Borders & Inputs
  border: {
    subtle: "hsl(220, 15%, 12%)",
    DEFAULT: "hsl(220, 15%, 18%)",
    strong: "hsl(220, 15%, 26%)",
    focus: "hsl(35, 90%, 50%)",
  },

  // Typography hierarchy
  text: {
    primary: "hsl(220, 15%, 96%)",
    secondary: "hsl(220, 15%, 75%)",
    muted: "hsl(220, 15%, 55%)",
    disabled: "hsl(220, 15%, 35%)",
    accent: "hsl(35, 90%, 50%)",
  },

  // Accessibility / Focus
  focusRing: "0 0 0 2px hsl(220, 15%, 4%), 0 0 0 4px hsl(35, 90%, 50%)",
  selection: "hsl(35, 90%, 50%)",
} as const;

// ── 2. Typography Presets ─────────────────────────────────────────────────────

export const typographyPresets = {
  display: {
    fontSize: "2.5rem",       // 40px
    lineHeight: "1.15",
    fontWeight: "700",
    letterSpacing: "-0.025em",
  },
  h1: {
    fontSize: "2rem",         // 32px
    lineHeight: "1.2",
    fontWeight: "700",
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "1.5rem",       // 24px
    lineHeight: "1.25",
    fontWeight: "600",
    letterSpacing: "-0.015em",
  },
  h3: {
    fontSize: "1.25rem",      // 20px
    lineHeight: "1.3",
    fontWeight: "600",
    letterSpacing: "-0.01em",
  },
  h4: {
    fontSize: "1.125rem",     // 18px
    lineHeight: "1.35",
    fontWeight: "600",
  },
  bodyLarge: {
    fontSize: "1.125rem",     // 18px
    lineHeight: "1.5",
    fontWeight: "400",
  },
  body: {
    fontSize: "1rem",         // 16px
    lineHeight: "1.5",
    fontWeight: "400",
  },
  bodySmall: {
    fontSize: "0.875rem",     // 14px
    lineHeight: "1.45",
    fontWeight: "400",
  },
  caption: {
    fontSize: "0.75rem",      // 12px
    lineHeight: "1.4",
    fontWeight: "400",
  },
  label: {
    fontSize: "0.875rem",     // 14px
    lineHeight: "1.2",
    fontWeight: "500",
    letterSpacing: "0.01em",
  },
  mono: {
    fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace",
    fontSize: "0.875rem",
    lineHeight: "1.4",
  },
} as const;

// ── 3. Telugu & English Font Adapters ─────────────────────────────────────────

export const fontFamilies = {
  english: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
  telugu: "'Noto Sans Telugu', 'Inter', sans-serif",
} as const;

/**
 * Detects if a text string contains Telugu Unicode characters (\u0C00 - \u0C7F).
 */
export function isTeluguText(text: string): boolean {
  return /[\u0C00-\u0C7F]/.test(text);
}

/**
 * Returns appropriate font-family string based on content language.
 */
export function getFontFamilyForText(text?: string): string {
  if (!text) return fontFamilies.english;
  return isTeluguText(text) ? fontFamilies.telugu : fontFamilies.english;
}

// ── 4. Spacing Scale ──────────────────────────────────────────────────────────

export const spacingScale = {
  0: "0px",
  0.5: "0.125rem",  // 2px
  1: "0.25rem",     // 4px
  1.5: "0.375rem",  // 6px
  2: "0.5rem",      // 8px
  2.5: "0.625rem",  // 10px
  3: "0.75rem",     // 12px
  4: "1rem",        // 16px
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  8: "2rem",        // 32px
  10: "2.5rem",     // 40px
  12: "3rem",       // 48px
  16: "4rem",       // 64px
} as const;

// ── 5. Radii Tokens ───────────────────────────────────────────────────────────

export const radiiTokens = {
  none: "0px",
  sm: "0.25rem",    // 4px
  md: "0.375rem",   // 6px
  lg: "0.5rem",     // 8px
  xl: "0.75rem",    // 12px
  "2xl": "1rem",    // 16px
  full: "9999px",
} as const;

// ── 6. Elevation & Shadows ────────────────────────────────────────────────────

export const elevationTokens = {
  flat: "none",
  low: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
  medium: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
  high: "0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)",
  floating: "0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.5)",
  glow: "0 0 15px hsla(35, 90%, 50%, 0.35)",
} as const;

// ── 7. Animation & Transitions ────────────────────────────────────────────────

export const transitionTokens = {
  fast: "100ms cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  smooth: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "350ms cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

// ── 8. Responsive Breakpoints ─────────────────────────────────────────────────

export const breakpoints = {
  phone: 320,
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
  ultraWide: 1536,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

/**
 * React hook to reactively track screen size against ScriptureCast breakpoints.
 */
export function useBreakpoint() {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    width: windowWidth,
    isPhone: windowWidth < breakpoints.tablet,
    isTablet: windowWidth >= breakpoints.tablet && windowWidth < breakpoints.laptop,
    isLaptop: windowWidth >= breakpoints.laptop && windowWidth < breakpoints.desktop,
    isDesktop: windowWidth >= breakpoints.desktop && windowWidth < breakpoints.ultraWide,
    isUltraWide: windowWidth >= breakpoints.ultraWide,
    isMobileOrTablet: windowWidth < breakpoints.laptop,
  };
}
