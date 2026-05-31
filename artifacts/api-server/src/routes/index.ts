import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bibleRouter from "./bible";
import presentationRouter from "./presentation";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bibleRouter);
router.use(presentationRouter);

export default router;
