import { Router, type IRouter } from "express";
import { getCurrentState, updateState, clearState } from "../lib/socketManager";
import type { PresentationState } from "../types/presentation";

const router: IRouter = Router();

// GET /presentation/state
router.get("/presentation/state", async (_req, res): Promise<void> => {
  const state = getCurrentState();
  res.json(state);
});

// POST /presentation/state
router.post("/presentation/state", async (req, res): Promise<void> => {
  const body = req.body as Partial<PresentationState>;
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Invalid presentation state body" });
    return;
  }

  const updated = updateState(body);
  res.json(updated);
});

// POST /presentation/clear
router.post("/presentation/clear", async (_req, res): Promise<void> => {
  const updated = clearState();
  res.json({ cleared: updated.cleared });
});

export default router;
