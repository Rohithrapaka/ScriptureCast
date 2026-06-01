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

// Primary data source: JSON files.
// The data directory lives at the repo root regardless of environment, but
// process.cwd() differs:
//   - Dev (pnpm --filter):  pnpm sets cwd to the package dir (artifacts/api-server)
//   - Production (Render):  node is started from the repo root
// We probe both candidate paths and use whichever exists.
const DATA_SUBPATH = "data/bible/jsonFormat/json";
const candidatePaths = [
  path.resolve(process.cwd(), DATA_SUBPATH),          // production: cwd = repo root
  path.resolve(process.cwd(), "../../", DATA_SUBPATH), // dev: cwd = artifacts/api-server
];
const JSON_DIR = candidatePaths.find(fs.existsSync) ?? candidatePaths[0];

/**
 * Load and parse the Telugu Bible dataset.
 * Format detected: { "TeluguBookName": { "chapterNum": { "verseNum": "text" } } }
 */
// Canonical biblical order (66 books, Genesis→Revelation)
const CANONICAL_ORDER: Record<string, number> = {
  'ఆదికాండము': 1,            // Genesis
  'నిర్గమకాండము': 2,          // Exodus
  'లేవీయకాండము': 3,           // Leviticus
  'సంఖ్యాకాండము': 4,          // Numbers
  'ద్వితియోపదేశకాండము': 5,    // Deuteronomy
  'యెహోషువ': 6,               // Joshua
  'న్యాయాధిపతులు': 7,         // Judges
  'రూతు': 8,                  // Ruth
  '1సమూయేలు': 9,             // 1 Samuel
  '2సమూయేలు': 10,            // 2 Samuel
  '1రాజులు': 11,              // 1 Kings
  '2రాజులు': 12,              // 2 Kings
  '1దినవృత్తాంతములు': 13,    // 1 Chronicles
  '2దినవృత్తాంతములు': 14,    // 2 Chronicles
  'ఎజ్రా': 15,                // Ezra
  'నెహెమ్యా': 16,             // Nehemiah
  'ఎస్తేరు': 17,              // Esther
  'యోబు': 18,                 // Job
  'కీర్తనలు': 19,             // Psalms
  'సామెతలు': 20,              // Proverbs
  'ప్రసంగి': 21,              // Ecclesiastes
  'పరమగీతము': 22,             // Song of Songs
  'యెషయా': 23,               // Isaiah
  'యిర్మియా': 24,             // Jeremiah
  'విలాపవాక్యములు': 25,       // Lamentations
  'యెహేజ్కేలు': 26,           // Ezekiel
  'దానియేలు': 27,             // Daniel
  'హోషేయా': 28,               // Hosea
  'యోవేలు': 29,               // Joel
  'ఆమోసు': 30,                // Amos
  'ఓబద్యా': 31,               // Obadiah
  'యోనా': 32,                 // Jonah
  'మీకా': 33,                 // Micah
  'నహూము': 34,                // Nahum
  'హబక్కూకు': 35,             // Habakkuk
  'జెఫన్యా': 36,              // Zephaniah
  'హగ్గయి': 37,               // Haggai
  'జెకర్యా': 38,              // Zechariah
  'మలాకీ': 39,                // Malachi
  'మత్తయి': 40,               // Matthew
  'మార్కు': 41,               // Mark
  'లూకా': 42,                 // Luke
  'యోహాను': 43,               // John
  'అపో.కార్యములు': 44,        // Acts
  'రోమీయులకు': 45,            // Romans
  '1కోరింథీయులకు': 46,        // 1 Corinthians
  '2కోరింథీయులకు': 47,        // 2 Corinthians
  'గలతియులకు': 48,            // Galatians
  'ఎఫెసీయులకు': 49,           // Ephesians
  'ఫిలిప్పీయులకు': 50,        // Philippians
  'కొలస్సీయులకు': 51,         // Colossians
  '1థెస్సలొనికయులకు': 52,    // 1 Thessalonians
  '2థెస్సలొనికయులకు': 53,    // 2 Thessalonians
  '1తిమోతికి': 54,            // 1 Timothy
  '2తిమోతికి': 55,            // 2 Timothy
  'తీతుకు': 56,               // Titus
  'ఫిలేమోనుకు': 57,           // Philemon
  'హెబ్రీయులకు': 58,          // Hebrews
  'యాకోబు': 59,               // James
  '1పేతురు': 60,              // 1 Peter
  '2పేతురు': 61,              // 2 Peter
  '1యోహాను': 62,              // 1 John
  '2యోహాను': 63,              // 2 John
  '3యోహాను': 64,              // 3 John
  'యూదా': 65,                 // Jude
  'ప్రకటన గ్రంథం': 66,        // Revelation
};

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

  // Sort books by canonical biblical order (Genesis → Revelation)
  books.sort((a, b) => {
    const posA = CANONICAL_ORDER[a.id] ?? 999;
    const posB = CANONICAL_ORDER[b.id] ?? 999;
    return posA - posB;
  });

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
