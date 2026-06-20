---
name: ScriptureCast Font Loading
description: How the 8 Telugu fonts are loaded and how auto-scale works
---

## Fonts loaded
All 8 Telugu fonts loaded via a single Google Fonts link in `index.html`:
Noto Sans Telugu, Noto Serif Telugu, Mandali, Ramabhadra, Gurajada, Suranna, Mallanna, Ponnala

Font categories shown in customization panel (Modern / Classic Serif / Clean / Bold Display / Elegant / Traditional / Readable / Decorative).

## Auto-scale
Function `computeAutoScale(text, textEnglish, language)` in `display.tsx`:
- Counts combined character length (English chars weighted 0.75× since narrower)
- Returns a multiplier: 1.4 (<60 chars) → 0.58 (>480 chars)
- Controlled by `typography.autoScale: boolean` toggle (default: true)
- Applied on top of the user's manual font size slider
- Verse key in AnimatePresence includes language+layout so transitions fire on mode change

**Why:** Long verses (Psalms 119) would overflow at 56px default; short ones (John 11:35) look tiny. Auto-scale keeps all verses visually balanced without per-verse manual tuning.
