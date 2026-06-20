import fs from "fs";
import path from "path";
import { logger } from "./logger";

export interface BibleBook {
  id: string;
  name: string;
  englishName: string;
  chapters: number;
}

export interface BibleVerse {
  number: number;
  text: string;
  textEnglish: string | null;
}

export interface BibleChapter {
  number: number;
  verses: number;
}

export interface VerseDetail {
  bookId: string;
  bookName: string;
  englishName: string;
  chapter: number;
  verse: number;
  text: string;
  textEnglish: string | null;
  reference: string;
  referenceEnglish: string;
}

interface BibleIndex {
  books: BibleBook[];
  telugu: Map<string, Map<number, BibleVerse[]>>;
}

let bibleIndex: BibleIndex | null = null;

// ── Path resolution ───────────────────────────────────────────────────────────

const DATA_SUBPATH = "data/bible/jsonFormat/json";
const candidatePaths = [
  path.resolve(process.cwd(), DATA_SUBPATH),
  path.resolve(process.cwd(), "../../", DATA_SUBPATH),
];
const JSON_DIR = candidatePaths.find(fs.existsSync) ?? candidatePaths[0];

const KJV_CANDIDATES = [
  path.resolve(process.cwd(), "data/bible/kjv.json"),
  path.resolve(process.cwd(), "../../data/bible/kjv.json"),
];
const KJV_PATH = KJV_CANDIDATES.find(fs.existsSync) ?? KJV_CANDIDATES[0];

// ── Canonical book order ──────────────────────────────────────────────────────

const CANONICAL_ORDER: Record<string, number> = {
  'ఆదికాండము': 1, 'నిర్గమకాండము': 2, 'లేవీయకాండము': 3, 'సంఖ్యాకాండము': 4,
  'ద్వితియోపదేశకాండము': 5, 'యెహోషువ': 6, 'న్యాయాధిపతులు': 7, 'రూతు': 8,
  '1సమూయేలు': 9, '2సమూయేలు': 10, '1రాజులు': 11, '2రాజులు': 12,
  '1దినవృత్తాంతములు': 13, '2దినవృత్తాంతములు': 14, 'ఎజ్రా': 15, 'నెహెమ్యా': 16,
  'ఎస్తేరు': 17, 'యోబు': 18, 'కీర్తనలు': 19, 'సామెతలు': 20, 'ప్రసంగి': 21,
  'పరమగీతము': 22, 'యెషయా': 23, 'యిర్మియా': 24, 'విలాపవాక్యములు': 25,
  'యెహేజ్కేలు': 26, 'దానియేలు': 27, 'హోషేయా': 28, 'యోవేలు': 29, 'ఆమోసు': 30,
  'ఓబద్యా': 31, 'యోనా': 32, 'మీకా': 33, 'నహూము': 34, 'హబక్కూకు': 35,
  'జెఫన్యా': 36, 'హగ్గయి': 37, 'జెకర్యా': 38, 'మలాకీ': 39, 'మత్తయి': 40,
  'మార్కు': 41, 'లూకా': 42, 'యోహాను': 43, 'అపో.కార్యములు': 44, 'రోమీయులకు': 45,
  '1కోరింథీయులకు': 46, '2కోరింథీయులకు': 47, 'గలతియులకు': 48, 'ఎఫెసీయులకు': 49,
  'ఫిలిప్పీయులకు': 50, 'కొలస్సీయులకు': 51, '1థెస్సలొనికయులకు': 52,
  '2థెస్సలొనికయులకు': 53, '1తిమోతికి': 54, '2తిమోతికి': 55, 'తీతుకు': 56,
  'ఫిలేమోనుకు': 57, 'హెబ్రీయులకు': 58, 'యాకోబు': 59, '1పేతురు': 60,
  '2పేతురు': 61, '1యోహాను': 62, '2యోహాను': 63, '3యోహాను': 64, 'యూదా': 65,
  'ప్రకటన గ్రంథం': 66,
};

/** Maps Telugu book ID → English display name */
const TELUGU_TO_ENGLISH: Record<string, string> = {
  'ఆదికాండము': 'Genesis', 'నిర్గమకాండము': 'Exodus', 'లేవీయకాండము': 'Leviticus',
  'సంఖ్యాకాండము': 'Numbers', 'ద్వితియోపదేశకాండము': 'Deuteronomy', 'యెహోషువ': 'Joshua',
  'న్యాయాధిపతులు': 'Judges', 'రూతు': 'Ruth', '1సమూయేలు': '1 Samuel',
  '2సమూయేలు': '2 Samuel', '1రాజులు': '1 Kings', '2రాజులు': '2 Kings',
  '1దినవృత్తాంతములు': '1 Chronicles', '2దినవృత్తాంతములు': '2 Chronicles',
  'ఎజ్రా': 'Ezra', 'నెహెమ్యా': 'Nehemiah', 'ఎస్తేరు': 'Esther', 'యోబు': 'Job',
  'కీర్తనలు': 'Psalms', 'సామెతలు': 'Proverbs', 'ప్రసంగి': 'Ecclesiastes',
  'పరమగీతము': 'Song of Solomon', 'యెషయా': 'Isaiah', 'యిర్మియా': 'Jeremiah',
  'విలాపవాక్యములు': 'Lamentations', 'యెహేజ్కేలు': 'Ezekiel', 'దానియేలు': 'Daniel',
  'హోషేయా': 'Hosea', 'యోవేలు': 'Joel', 'ఆమోసు': 'Amos', 'ఓబద్యా': 'Obadiah',
  'యోనా': 'Jonah', 'మీకా': 'Micah', 'నహూము': 'Nahum', 'హబక్కూకు': 'Habakkuk',
  'జెఫన్యా': 'Zephaniah', 'హగ్గయి': 'Haggai', 'జెకర్యా': 'Zechariah', 'మలాకీ': 'Malachi',
  'మత్తయి': 'Matthew', 'మార్కు': 'Mark', 'లూకా': 'Luke', 'యోహాను': 'John',
  'అపో.కార్యములు': 'Acts', 'రోమీయులకు': 'Romans', '1కోరింథీయులకు': '1 Corinthians',
  '2కోరింథీయులకు': '2 Corinthians', 'గలతియులకు': 'Galatians', 'ఎఫెసీయులకు': 'Ephesians',
  'ఫిలిప్పీయులకు': 'Philippians', 'కొలస్సీయులకు': 'Colossians',
  '1థెస్సలొనికయులకు': '1 Thessalonians', '2థెస్సలొనికయులకు': '2 Thessalonians',
  '1తిమోతికి': '1 Timothy', '2తిమోతికి': '2 Timothy', 'తీతుకు': 'Titus',
  'ఫిలేమోనుకు': 'Philemon', 'హెబ్రీయులకు': 'Hebrews', 'యాకోబు': 'James',
  '1పేతురు': '1 Peter', '2పేతురు': '2 Peter', '1యోహాను': '1 John',
  '2యోహాను': '2 John', '3యోహాను': '3 John', 'యూదా': 'Jude', 'ప్రకటన గ్రంథం': 'Revelation',
};

/**
 * Maps Telugu book ID → KJV flat-file key prefix.
 * All standard except Solomon's Song.
 */
const TELUGU_TO_KJV_KEY: Record<string, string> = {
  ...TELUGU_TO_ENGLISH,
  // Overrides where KJV key differs from our English display name:
  'పరమగీతము': "Solomon's Song",
  'కీర్తనలు': 'Psalms',
};

// ── KJV text cleanup ──────────────────────────────────────────────────────────

function cleanKjv(raw: string): string {
  return raw
    .replace(/^#\s*/, '')           // strip paragraph mark
    .replace(/\[([^\]]+)\]/g, '$1') // strip italic brackets, keep word
    .trim();
}

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loadBibleData(): Promise<void> {
  if (bibleIndex) return;

  if (!fs.existsSync(JSON_DIR)) {
    logger.warn({ jsonDir: JSON_DIR }, "Bible JSON data directory not found");
    bibleIndex = { books: [], telugu: new Map() };
    return;
  }

  logger.info({ jsonDir: JSON_DIR }, "Loading Telugu Bible dataset...");

  // ── Load Telugu data ──────────────────────────────────────────────────────

  const files = fs.readdirSync(JSON_DIR).filter((f) => f.endsWith(".json")).sort();
  const books: BibleBook[] = [];
  const teluguData = new Map<string, Map<number, { number: number; text: string }[]>>();

  for (const file of files) {
    try {
      const obj = JSON.parse(
        fs.readFileSync(path.join(JSON_DIR, file), "utf-8")
      ) as Record<string, Record<string, Record<string, string>>>;

      const bookName = Object.keys(obj)[0];
      if (!bookName) continue;
      if (teluguData.has(bookName)) continue; // skip duplicates (e.g. 3.json = Nehemiah dup)

      const chaptersMap = new Map<number, { number: number; text: string }[]>();
      for (const [chStr, versesRaw] of Object.entries(obj[bookName])) {
        const ch = parseInt(chStr, 10);
        if (isNaN(ch)) continue;
        const verses: { number: number; text: string }[] = [];
        for (const [vStr, text] of Object.entries(versesRaw)) {
          const vNum = parseInt(vStr, 10);
          if (isNaN(vNum)) continue;
          verses.push({ number: vNum, text: String(text).trim().replace(/\s+/g, " ") });
        }
        verses.sort((a, b) => a.number - b.number);
        chaptersMap.set(ch, verses);
      }

      teluguData.set(bookName, chaptersMap);
      books.push({
        id: bookName,
        name: bookName,
        englishName: TELUGU_TO_ENGLISH[bookName] ?? bookName,
        chapters: chaptersMap.size,
      });
    } catch (err) {
      logger.warn({ file, err }, "Failed to parse Telugu book file");
    }
  }

  books.sort((a, b) => (CANONICAL_ORDER[a.id] ?? 999) - (CANONICAL_ORDER[b.id] ?? 999));

  // ── Load KJV data ─────────────────────────────────────────────────────────

  // kjvIndex: teluguBookId → chapter → verse → cleaned English text
  const kjvIndex = new Map<string, Map<number, Map<number, string>>>();

  if (fs.existsSync(KJV_PATH)) {
    logger.info({ kjvPath: KJV_PATH }, "Loading KJV dataset...");
    try {
      const kjvRaw = JSON.parse(fs.readFileSync(KJV_PATH, "utf-8")) as Record<string, string>;

      // Build reverse map: kjvKey → teluguId
      const kjvKeyToTelugu = new Map<string, string>();
      for (const [tel, kjvKey] of Object.entries(TELUGU_TO_KJV_KEY)) {
        kjvKeyToTelugu.set(kjvKey, tel);
      }

      for (const [ref, rawText] of Object.entries(kjvRaw)) {
        const m = ref.match(/^(.+?) (\d+):(\d+)$/);
        if (!m) continue;
        const [, kjvKey, chStr, vStr] = m;
        const teluguId = kjvKeyToTelugu.get(kjvKey);
        if (!teluguId) continue;

        const ch = parseInt(chStr, 10);
        const vNum = parseInt(vStr, 10);
        if (isNaN(ch) || isNaN(vNum)) continue;

        if (!kjvIndex.has(teluguId)) kjvIndex.set(teluguId, new Map());
        const chapMap = kjvIndex.get(teluguId)!;
        if (!chapMap.has(ch)) chapMap.set(ch, new Map());
        chapMap.get(ch)!.set(vNum, cleanKjv(rawText));
      }

      logger.info({ bookCount: kjvIndex.size }, "KJV dataset loaded");
    } catch (err) {
      logger.warn({ err }, "Failed to load KJV dataset — continuing Telugu-only");
    }
  } else {
    logger.warn({ kjvPath: KJV_PATH }, "KJV dataset not found — running Telugu-only");
  }

  // ── Merge: attach English text to each Telugu verse ───────────────────────

  const merged = new Map<string, Map<number, BibleVerse[]>>();
  for (const [bookId, chapMap] of teluguData) {
    const bookKjv = kjvIndex.get(bookId);
    const mergedChaps = new Map<number, BibleVerse[]>();
    for (const [ch, verses] of chapMap) {
      const chKjv = bookKjv?.get(ch);
      mergedChaps.set(
        ch,
        verses.map((v) => ({
          number: v.number,
          text: v.text,
          textEnglish: chKjv?.get(v.number) ?? null,
        }))
      );
    }
    merged.set(bookId, mergedChaps);
  }

  bibleIndex = { books, telugu: merged };
  logger.info({ bookCount: books.length }, "Bible dataset loaded (Telugu + KJV)");
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getBooks(): BibleBook[] {
  return bibleIndex?.books ?? [];
}

export function getChapters(bookId: string): BibleChapter[] | null {
  const chapMap = bibleIndex?.telugu.get(bookId);
  if (!chapMap) return null;
  return [...chapMap.entries()]
    .map(([num, verses]) => ({ number: num, verses: verses.length }))
    .sort((a, b) => a.number - b.number);
}

export function getVerses(bookId: string, chapter: number): BibleVerse[] | null {
  return bibleIndex?.telugu.get(bookId)?.get(chapter) ?? null;
}

export function getSingleVerse(bookId: string, chapter: number, verse: number): VerseDetail | null {
  const verses = getVerses(bookId, chapter);
  if (!verses) return null;
  const found = verses.find((v) => v.number === verse);
  if (!found) return null;
  const englishName = TELUGU_TO_ENGLISH[bookId] ?? bookId;
  return {
    bookId,
    bookName: bookId,
    englishName,
    chapter,
    verse,
    text: found.text,
    textEnglish: found.textEnglish,
    reference: `${bookId} ${chapter}:${verse}`,
    referenceEnglish: `${englishName} ${chapter}:${verse}`,
  };
}

export function getEnglishName(bookId: string): string {
  return TELUGU_TO_ENGLISH[bookId] ?? bookId;
}

export function searchByReference(query: string): VerseDetail | null {
  if (!bibleIndex?.books.length) return null;
  const q = query.trim();
  const match = q.match(/^(.+?)\s+(\d+):(\d+)/u);
  if (!match) return null;
  const bookQuery = match[1].trim().toLowerCase();
  const chapter = parseInt(match[2], 10);
  const verse = parseInt(match[3], 10);
  if (isNaN(chapter) || isNaN(verse)) return null;
  const book =
    bibleIndex.books.find((b) => b.name.toLowerCase() === bookQuery) ??
    bibleIndex.books.find((b) => b.englishName.toLowerCase() === bookQuery) ??
    bibleIndex.books.find((b) => b.name.toLowerCase().includes(bookQuery)) ??
    bibleIndex.books.find((b) => b.englishName.toLowerCase().startsWith(bookQuery));
  if (!book) return null;
  return getSingleVerse(book.id, chapter, verse);
}

export function isDataLoaded(): boolean {
  return bibleIndex !== null && bibleIndex.books.length > 0;
}
