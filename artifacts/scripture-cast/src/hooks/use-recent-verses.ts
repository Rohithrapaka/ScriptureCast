import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RecentVerseEntry {
  bookId:           string; // canonical Telugu book ID
  bookName:         string; // Telugu book name
  englishName:      string; // English book name
  chapter:          number;
  verse:            number;
  reference:        string; // Telugu  — e.g. "యోహాను 3:16"
  referenceEnglish: string; // English — e.g. "John 3:16"
}

// ── Canonical identity (language-agnostic) ────────────────────────────────────

export function entryId(e: Pick<RecentVerseEntry, 'bookId' | 'chapter' | 'verse'>): string {
  return `${e.bookId}::${e.chapter}::${e.verse}`;
}

// ── Store ─────────────────────────────────────────────────────────────────────

const MAX_HISTORY = 15;

interface RecentVersesStore {
  entries: RecentVerseEntry[];
  /** Add (or move-to-front) a manually-selected verse. Deduplicates by canonical ID. */
  addVerse:    (entry: RecentVerseEntry) => void;
  /** Remove a single entry by its canonical ID string. */
  removeVerse: (id: string) => void;
  /** Wipe the entire list. */
  clearAll:    () => void;
}

export const useRecentVerses = create<RecentVersesStore>()(
  persist(
    (set) => ({
      entries: [],

      addVerse: (entry) =>
        set((state) => {
          const id       = entryId(entry);
          const filtered = state.entries.filter((e) => entryId(e) !== id);
          return { entries: [entry, ...filtered].slice(0, MAX_HISTORY) };
        }),

      removeVerse: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => entryId(e) !== id),
        })),

      clearAll: () => set({ entries: [] }),
    }),
    { name: 'scripture-cast-recent-verses' }
  )
);
