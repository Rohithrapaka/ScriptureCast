/**
 * songService.ts — Song & Lyrics Service
 *
 * Provides CRUD operations for songs and song sections via Drizzle ORM
 * with seamless in-memory fallback when PostgreSQL (DATABASE_URL) is not configured.
 */

import { eq, asc } from "drizzle-orm";
import {
  getDb,
  songsTable,
  songSectionsTable,
  type Song,
  type InsertSong,
  type SongSection,
  type InsertSongSection,
  type SongSectionType,
} from "@workspace/db";

// In-memory fallback stores
let inMemorySongs: Song[] = [
  {
    id: "sample-song-1",
    title: "ఆరాధన స్తుతి ఆరాధన (Aradhana Stuthi)",
    originalTitle: "Aradhana Stuthi Aradhana",
    artistAuthor: "Traditional",
    key: "E",
    bpm: 72,
    category: "Worship",
    tags: ["Worship", "Telugu"],
    language: "telugu",
    defaultThemeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sample-song-2",
    title: "Amazing Grace",
    originalTitle: "Amazing Grace",
    artistAuthor: "John Newton",
    key: "G",
    bpm: 68,
    category: "Hymn",
    tags: ["Hymn", "Classic"],
    language: "english",
    defaultThemeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let inMemorySections: SongSection[] = [
  {
    id: "sec-1-1",
    songId: "sample-song-1",
    type: "chorus",
    sectionNumber: 1,
    label: "Chorus",
    hotkey: "C",
    lyricsPrimary: "ఆరాధన స్తుతి ఆరాధన\nనీకేనయ్యా నా యేసయ్యా\nజీవితాంతం నీకేనయ్యా",
    lyricsSecondary: "Aradhana sthuthi aradhana\nNeekenayya naa Yesayya\nJeevithantham neekenayya",
    orderIndex: 0,
  },
  {
    id: "sec-1-2",
    songId: "sample-song-1",
    type: "verse",
    sectionNumber: 1,
    label: "Verse 1",
    hotkey: "1",
    lyricsPrimary: "నా ప్రాణమైన దేవుడవు నీవే\nనా శత్రువుల ఎదుట నన్ను కాపాడితివి\nనీ కృప నాపై నిత్యముండును",
    lyricsSecondary: "Naa pranamaina Devudavu neeve\nNaa shathruvula eduta nannu kaapadithivi\nNee krupa naapai nithyamundunu",
    orderIndex: 1,
  },
  {
    id: "sec-2-1",
    songId: "sample-song-2",
    type: "verse",
    sectionNumber: 1,
    label: "Verse 1",
    hotkey: "1",
    lyricsPrimary: "Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.",
    lyricsSecondary: null,
    orderIndex: 0,
  },
  {
    id: "sec-2-2",
    songId: "sample-song-2",
    type: "verse",
    sectionNumber: 2,
    label: "Verse 2",
    hotkey: "2",
    lyricsPrimary: "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed.",
    lyricsSecondary: null,
    orderIndex: 1,
  },
];

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface SongWithSections extends Song {
  sections: SongSection[];
}

export interface CreateSongInput {
  title: string;
  originalTitle?: string;
  artistAuthor?: string;
  key?: string;
  bpm?: number;
  category?: string;
  tags?: string[];
  language?: string; // e.g., "english", "telugu", "hindi", "tamil", "malayalam", "kannada"
  sections?: {
    type: SongSectionType;
    sectionNumber?: number;
    label: string;
    hotkey?: string;
    lyricsPrimary: string;
    lyricsSecondary?: string;
  }[];
}

export interface UpdateSongInput {
  title?: string;
  originalTitle?: string;
  artistAuthor?: string;
  key?: string;
  bpm?: number;
  category?: string;
  tags?: string[];
  language?: string; // e.g., "english", "telugu", "hindi", "tamil", "malayalam", "kannada"
}

export interface CreateSectionInput {
  songId: string;
  type: SongSectionType;
  sectionNumber?: number;
  label: string;
  hotkey?: string;
  lyricsPrimary: string;
  lyricsSecondary?: string;
  orderIndex?: number;
}

export interface UpdateSectionInput {
  type?: SongSectionType;
  sectionNumber?: number;
  label?: string;
  hotkey?: string;
  lyricsPrimary?: string;
  lyricsSecondary?: string;
  orderIndex?: number;
}

export async function listSongs(): Promise<SongWithSections[]> {
  try {
    const db = getDb();
    const songs = await db.select().from(songsTable).orderBy(songsTable.title);
    const allSections = await db
      .select()
      .from(songSectionsTable)
      .orderBy(asc(songSectionsTable.orderIndex));

    return songs.map((s) => ({
      ...s,
      sections: allSections.filter((sec) => sec.songId === s.id),
    }));
  } catch (_err) {
    // In-memory fallback
    return inMemorySongs.map((s) => ({
      ...s,
      sections: inMemorySections
        .filter((sec) => sec.songId === s.id)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    }));
  }
}

export async function getSongById(id: string): Promise<SongWithSections | null> {
  try {
    const db = getDb();
    const [song] = await db.select().from(songsTable).where(eq(songsTable.id, id)).limit(1);
    if (!song) return null;

    const sections = await db
      .select()
      .from(songSectionsTable)
      .where(eq(songSectionsTable.songId, id))
      .orderBy(asc(songSectionsTable.orderIndex));

    return { ...song, sections };
  } catch (_err) {
    const song = inMemorySongs.find((s) => s.id === id);
    if (!song) return null;

    const sections = inMemorySections
      .filter((sec) => sec.songId === id)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    return { ...song, sections };
  }
}

export async function createSong(input: CreateSongInput): Promise<SongWithSections> {
  const songId = genId();
  const newSong: Song = {
    id: songId,
    title: input.title.trim(),
    originalTitle: input.originalTitle?.trim() || null,
    artistAuthor: input.artistAuthor?.trim() || null,
    key: input.key?.trim() || null,
    bpm: input.bpm || null,
    category: input.category?.trim() || "Worship",
    tags: input.tags || [],
    language: input.language || "english",
    defaultThemeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const db = getDb();
    const [created] = await db.insert(songsTable).values(newSong).returning();
    const createdSections: SongSection[] = [];

    if (input.sections && input.sections.length > 0) {
      for (let i = 0; i < input.sections.length; i++) {
        const secInput = input.sections[i];
        const sec: InsertSongSection = {
          songId: created.id,
          type: secInput.type,
          sectionNumber: secInput.sectionNumber || 1,
          label: secInput.label,
          hotkey: secInput.hotkey || null,
          lyricsPrimary: secInput.lyricsPrimary,
          lyricsSecondary: secInput.lyricsSecondary || null,
          orderIndex: i,
        };
        const [savedSec] = await db.insert(songSectionsTable).values(sec).returning();
        createdSections.push(savedSec);
      }
    }

    return { ...created, sections: createdSections };
  } catch (_err) {
    inMemorySongs.push(newSong);
    const createdSections: SongSection[] = [];

    if (input.sections && input.sections.length > 0) {
      for (let i = 0; i < input.sections.length; i++) {
        const secInput = input.sections[i];
        const sec: SongSection = {
          id: genId(),
          songId,
          type: secInput.type,
          sectionNumber: secInput.sectionNumber || 1,
          label: secInput.label,
          hotkey: secInput.hotkey || null,
          lyricsPrimary: secInput.lyricsPrimary,
          lyricsSecondary: secInput.lyricsSecondary || null,
          orderIndex: i,
        };
        inMemorySections.push(sec);
        createdSections.push(sec);
      }
    }

    return { ...newSong, sections: createdSections };
  }
}

export async function updateSong(id: string, input: UpdateSongInput): Promise<SongWithSections> {
  try {
    const db = getDb();
    const [updated] = await db
      .update(songsTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(songsTable.id, id))
      .returning();

    if (!updated) throw new Error("Song not found");

    const sections = await db
      .select()
      .from(songSectionsTable)
      .where(eq(songSectionsTable.songId, id))
      .orderBy(asc(songSectionsTable.orderIndex));

    return { ...updated, sections };
  } catch (err) {
    const idx = inMemorySongs.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Song not found");

    inMemorySongs[idx] = {
      ...inMemorySongs[idx],
      ...input,
      updatedAt: new Date(),
    };

    const sections = inMemorySections
      .filter((sec) => sec.songId === id)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    return { ...inMemorySongs[idx], sections };
  }
}

export async function deleteSong(id: string): Promise<void> {
  try {
    const db = getDb();
    await db.delete(songsTable).where(eq(songsTable.id, id));
  } catch (_err) {
    inMemorySongs = inMemorySongs.filter((s) => s.id !== id);
    inMemorySections = inMemorySections.filter((sec) => sec.songId !== id);
  }
}

export async function addSection(input: CreateSectionInput): Promise<SongSection> {
  const secId = genId();
  const newSec: SongSection = {
    id: secId,
    songId: input.songId,
    type: input.type,
    sectionNumber: input.sectionNumber || 1,
    label: input.label,
    hotkey: input.hotkey || null,
    lyricsPrimary: input.lyricsPrimary,
    lyricsSecondary: input.lyricsSecondary || null,
    orderIndex: input.orderIndex ?? inMemorySections.filter((s) => s.songId === input.songId).length,
  };

  try {
    const db = getDb();
    const [created] = await db.insert(songSectionsTable).values(newSec).returning();
    return created;
  } catch (_err) {
    inMemorySections.push(newSec);
    return newSec;
  }
}

export async function updateSection(id: string, input: UpdateSectionInput): Promise<SongSection> {
  try {
    const db = getDb();
    const [updated] = await db
      .update(songSectionsTable)
      .set(input)
      .where(eq(songSectionsTable.id, id))
      .returning();
    if (!updated) throw new Error("Section not found");
    return updated;
  } catch (_err) {
    const idx = inMemorySections.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Section not found");
    inMemorySections[idx] = { ...inMemorySections[idx], ...input };
    return inMemorySections[idx];
  }
}

export async function deleteSection(id: string): Promise<void> {
  try {
    const db = getDb();
    await db.delete(songSectionsTable).where(eq(songSectionsTable.id, id));
  } catch (_err) {
    inMemorySections = inMemorySections.filter((s) => s.id !== id);
  }
}
