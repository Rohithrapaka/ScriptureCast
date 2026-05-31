import { Router, type IRouter } from "express";
import {
  GetPresentationStateResponse,
  UpdatePresentationStateBody,
  UpdatePresentationStateResponse,
  ClearPresentationResponse,
} from "@workspace/api-zod";
import { getCurrentState, updateState, clearState } from "../lib/socketManager";

const router: IRouter = Router();

// GET /presentation/state
router.get("/presentation/state", async (_req, res): Promise<void> => {
  const state = getCurrentState();
  res.json(GetPresentationStateResponse.parse(state));
});

// POST /presentation/state
router.post("/presentation/state", async (req, res): Promise<void> => {
  const parsed = UpdatePresentationStateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updated = updateState(parsed.data as Parameters<typeof updateState>[0]);
  res.json(UpdatePresentationStateResponse.parse(updated));
});

// POST /presentation/clear
router.post("/presentation/clear", async (_req, res): Promise<void> => {
  const updated = clearState();
  res.json(ClearPresentationResponse.parse({ cleared: updated.cleared }));
});

export default router;
