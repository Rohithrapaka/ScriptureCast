/**
 * songs.ts — Songs REST API
 *
 * Provides endpoints to list, create, update, and delete songs and sections.
 * Public GET allows read access for presenters/viewers; CUD requires authentication.
 */

import { Router, type Request, type Response } from "express";
import {
  authenticateToken,
  requireRole,
} from "../middlewares/auth.middleware";
import {
  listSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  addSection,
  updateSection,
  deleteSection,
} from "../services/songService";

const router = Router();

function sendError(res: Response, err: unknown): void {
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status ?? 500;
    res.status(status).json({ error: err.message });
  } else {
    res.status(500).json({ error: "An unexpected error occurred" });
  }
}

// GET /api/songs — List all songs with their sections
router.get("/songs", async (_req: Request, res: Response) => {
  try {
    const songs = await listSongs();
    res.json({ songs });
  } catch (err) {
    sendError(res, err);
  }
});

// GET /api/songs/:id — Get a single song
router.get("/songs/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const song = await getSongById(req.params.id);
    if (!song) {
      res.status(404).json({ error: "Song not found" });
      return;
    }
    res.json({ song });
  } catch (err) {
    sendError(res, err);
  }
});

// POST /api/songs — Create a new song
router.post(
  "/songs",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { title, originalTitle, artistAuthor, key, bpm, category, tags, language, sections } = req.body;
      if (!title || !title.trim()) {
        res.status(400).json({ error: "Song title is required" });
        return;
      }
      const song = await createSong({
        title,
        originalTitle,
        artistAuthor,
        key,
        bpm,
        category,
        tags,
        language,
        sections,
      });
      res.status(201).json({ song });
    } catch (err) {
      sendError(res, err);
    }
  },
);

// PUT /api/songs/:id — Update song metadata
router.put(
  "/songs/:id",
  authenticateToken,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const song = await updateSong(req.params.id, req.body);
      res.json({ song });
    } catch (err) {
      sendError(res, err);
    }
  },
);

// DELETE /api/songs/:id — Delete a song
router.delete(
  "/songs/:id",
  authenticateToken,
  requireRole("super_admin", "admin", "presenter"),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      await deleteSong(req.params.id);
      res.status(204).send();
    } catch (err) {
      sendError(res, err);
    }
  },
);

// POST /api/songs/:id/sections — Add a section to a song
router.post(
  "/songs/:id/sections",
  authenticateToken,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { type, sectionNumber, label, hotkey, lyricsPrimary, lyricsSecondary, orderIndex } = req.body;
      if (!label || !lyricsPrimary) {
        res.status(400).json({ error: "label and lyricsPrimary are required" });
        return;
      }
      const section = await addSection({
        songId: req.params.id,
        type: type || "verse",
        sectionNumber,
        label,
        hotkey,
        lyricsPrimary,
        lyricsSecondary,
        orderIndex,
      });
      res.status(201).json({ section });
    } catch (err) {
      sendError(res, err);
    }
  },
);

// PUT /api/songs/sections/:sectionId — Update a section
router.put(
  "/songs/sections/:sectionId",
  authenticateToken,
  async (req: Request<{ sectionId: string }>, res: Response) => {
    try {
      const section = await updateSection(req.params.sectionId, req.body);
      res.json({ section });
    } catch (err) {
      sendError(res, err);
    }
  },
);

// DELETE /api/songs/sections/:sectionId — Delete a section
router.delete(
  "/songs/sections/:sectionId",
  authenticateToken,
  async (req: Request<{ sectionId: string }>, res: Response) => {
    try {
      await deleteSection(req.params.sectionId);
      res.status(204).send();
    } catch (err) {
      sendError(res, err);
    }
  },
);

export default router;
