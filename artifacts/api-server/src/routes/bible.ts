import { Router, type IRouter } from "express";
import {
  loadBibleData,
  getBooks,
  getChapters,
  getVerses,
  getSingleVerse,
  searchByReference,
} from "../lib/bibleParser";
import {
  ListBooksResponse,
  ListChaptersParams,
  ListChaptersResponse,
  ListVersesParams,
  ListVersesResponse,
  GetVerseParams,
  GetVerseResponse,
  SearchBibleQueryParams,
  SearchBibleResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Ensure data is loaded before handling requests
router.use(async (_req, _res, next) => {
  await loadBibleData();
  next();
});

// GET /bible/books
router.get("/bible/books", async (_req, res): Promise<void> => {
  const books = getBooks();
  res.json(ListBooksResponse.parse(books));
});

// GET /bible/books/:bookId/chapters
router.get("/bible/books/:bookId/chapters", async (req, res): Promise<void> => {
  const params = ListChaptersParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const chapters = getChapters(params.data.bookId);
  if (!chapters) {
    res.status(404).json({ error: `Book '${params.data.bookId}' not found` });
    return;
  }

  res.json(ListChaptersResponse.parse(chapters));
});

// GET /bible/books/:bookId/chapters/:chapterNum/verses
router.get("/bible/books/:bookId/chapters/:chapterNum/verses", async (req, res): Promise<void> => {
  const params = ListVersesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { bookId, chapterNum } = params.data;
  const verses = getVerses(bookId, Number(chapterNum));
  if (!verses) {
    res.status(404).json({ error: `Chapter ${chapterNum} not found in book '${bookId}'` });
    return;
  }

  res.json(ListVersesResponse.parse(verses));
});

// GET /bible/books/:bookId/chapters/:chapterNum/verses/:verseNum
router.get("/bible/books/:bookId/chapters/:chapterNum/verses/:verseNum", async (req, res): Promise<void> => {
  const params = GetVerseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { bookId, chapterNum, verseNum } = params.data;
  const verse = getSingleVerse(bookId, Number(chapterNum), Number(verseNum));
  if (!verse) {
    res.status(404).json({ error: `Verse ${bookId} ${chapterNum}:${verseNum} not found` });
    return;
  }

  res.json(GetVerseResponse.parse(verse));
});

// GET /bible/search?q=...
router.get("/bible/search", async (req, res): Promise<void> => {
  const parsed = SearchBibleQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = searchByReference(parsed.data.q);
  res.json(SearchBibleResponse.parse({ query: parsed.data.q, result: result ?? null }));
});

export default router;
