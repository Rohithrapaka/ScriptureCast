import fs from "fs";
import path from "path";
import { logger } from "./logger";

export interface BibleBook {
  id: string;
  name: string;
  chapters: number;
}

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapter {
  number: number;
  verses: number;
}

export interface VerseDetail {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

interface BibleIndex {
  books: BibleBook[];
  data: Map<string, Map<number, BibleVerse[]>>;
}

let bibleIndex: BibleIndex | null = null;

// Primary data source: JSON files
// The api-server cwd is artifacts/api-server/; data lives at workspace root
const JSON_DIR = path.resolve(process.cwd(), "../../data/bible/jsonFormat/json");

/**
 * Load and parse the Telugu Bible dataset.
 * Format detected: { "TeluguBookName": { "chapterNum": { "verseNum": "text" } } }
 */
export async function loadBibleData(): Promise<void> {
  if (bibleIndex) return;

  if (!fs.existsSync(JSON_DIR)) {
    logger.warn({ jsonDir: JSON_DIR }, "Bible JSON data directory not found");
    bibleIndex = { books: [], data: new Map() };
    return;
  }

  logger.info({ jsonDir: JSON_DIR }, "Loading Telugu Bible dataset...");

  const files = fs
    .readdirSync(JSON_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    logger.warn("No JSON Bible files found");
    bibleIndex = { books: [], data: new Map() };
    return;
  }

  const books: BibleBook[] = [];
  const data = new Map<string, Map<number, BibleVerse[]>>();

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(JSON_DIR, file), "utf-8");
      const obj = JSON.parse(raw) as Record<string, Record<string, Record<string, string>>>;

      // Each file has exactly one top-level key: the Telugu book name
      const bookName = Object.keys(obj)[0];
      if (!bookName) continue;

      const chaptersRaw = obj[bookName];
      const chaptersMap = new Map<number, BibleVerse[]>();

      for (const [chapterStr, versesRaw] of Object.entries(chaptersRaw)) {
        const chapterNum = parseInt(chapterStr, 10);
        if (isNaN(chapterNum)) continue;

        const verses: BibleVerse[] = [];
        for (const [verseStr, text] of Object.entries(versesRaw)) {
          const verseNum = parseInt(verseStr, 10);
          if (isNaN(verseNum)) continue;
          verses.push({ number: verseNum, text: String(text).trim().replace(/\s+/g, " ") });
        }
        verses.sort((a, b) => a.number - b.number);
        chaptersMap.set(chapterNum, verses);
      }

      // Skip duplicates (e.g. numeric-named files containing the same book)
      if (data.has(bookName)) continue;

      data.set(bookName, chaptersMap);
      books.push({
        id: bookName,
        name: bookName,
        chapters: chaptersMap.size,
      });
    } catch (err) {
      logger.warn({ file, err }, "Failed to parse Bible book file");
    }
  }

  // Sort books by canonical Telugu Bible order using the English abbrev directory as a guide
  // (books are already in order from how Kaggle stored them; keep file sort order)
  bibleIndex = { books, data };
  logger.info({ bookCount: books.length }, "Telugu Bible dataset loaded successfully");
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function getBooks(): BibleBook[] {
  return bibleIndex?.books ?? [];
}

export function getChapters(bookId: string): BibleChapter[] | null {
  const chapMap = bibleIndex?.data.get(bookId);
  if (!chapMap) return null;
  return [...chapMap.entries()]
    .map(([num, verses]) => ({ number: num, verses: verses.length }))
    .sort((a, b) => a.number - b.number);
}

export function getVerses(bookId: string, chapter: number): BibleVerse[] | null {
  const chapMap = bibleIndex?.data.get(bookId);
  if (!chapMap) return null;
  return chapMap.get(chapter) ?? null;
}

export function getSingleVerse(bookId: string, chapter: number, verse: number): VerseDetail | null {
  const verses = getVerses(bookId, chapter);
  if (!verses) return null;
  const found = verses.find((v) => v.number === verse);
  if (!found) return null;
  return {
    bookId,
    bookName: bookId,
    chapter,
    verse,
    text: found.text,
    reference: `${bookId} ${chapter}:${verse}`,
  };
}

/**
 * Search by reference string.
 * Supports: "BookName chapter:verse" in Telugu or partial match.
 * Example: "యోహాను 3:16" or "John 3:16" (fuzzy English match)
 */
export function searchByReference(query: string): VerseDetail | null {
  if (!bibleIndex || bibleIndex.books.length === 0) return null;

  const q = query.trim();

  // Pattern: "BookName chapter:verse"
  const refPattern = /^(.+?)\s+(\d+):(\d+)/u;
  const match = q.match(refPattern);
  if (!match) return null;

  const bookQuery = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const verse = parseInt(match[3], 10);

  if (isNaN(chapter) || isNaN(verse)) return null;

  // Find matching book: exact match first, then partial
  const bookQueryLower = bookQuery.toLowerCase();
  const book =
    bibleIndex.books.find((b) => b.name.toLowerCase() === bookQueryLower) ??
    bibleIndex.books.find((b) => b.name.toLowerCase().includes(bookQueryLower)) ??
    bibleIndex.books.find((b) => bookQueryLower.includes(b.name.toLowerCase().substring(0, 3)));

  if (!book) return null;
  return getSingleVerse(book.id, chapter, verse);
}

export function isDataLoaded(): boolean {
  return bibleIndex !== null && bibleIndex.books.length > 0;
}
