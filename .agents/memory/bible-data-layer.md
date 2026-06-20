---
name: ScriptureCast Bible Data Layer
description: How the bilingual Telugu+KJV data layer works, key design decisions and quirks
---

## Book ID scheme
Book IDs remain the Telugu name (e.g. "యోహాను") throughout the full stack — API routes, Zustand store, Socket messages. No canonical slug was introduced; English names are additive metadata only.

## Data loading (bibleParser.ts)
- Telugu: 67 JSON files in `data/bible/jsonFormat/json/` (66 unique — `3.json` is a Nehemiah duplicate, skipped by the existing duplicate-check)
- KJV: `data/bible/kjv.json` (downloaded from farskipper/kjv at build time), flat dict `"BookName Ch:V": "text"`
- KJV quirks: `#` prefix = paragraph mark (strip), `[word]` = italic supplied word (strip brackets keep word), "Solomon's Song" (not "Song of Solomon") maps to "పరమగీతము", "Psalms" (not "Psalm")
- Both are merged at startup; every BibleVerse carries `textEnglish: string | null`

## API response shape
- `Book`: `{ id, name, englishName, chapters }`
- `Verse` (list): `{ number, text, textEnglish }`
- `VerseDetail` (single): `{ bookId, bookName, englishName, chapter, verse, text, textEnglish, reference, referenceEnglish }`
- `PresentationState`: adds `language: 'telugu'|'english'|'both'`, `layout: 'stack'|'side-by-side'`

## Frontend language mode
- Stored in Zustand store (`language`, `layout`) and persisted to localStorage
- Broadcast with every state update to server so display screen gets the mode
- `VerseDisplay` (display.tsx `DisplayPreview`) reads `language` and `layout` from store and handles three render paths: single-language, stack-bilingual, side-by-side-bilingual

**Why:** Clean separation — verse data always carries both texts; the display mode is a presentation preference orthogonal to the content.
