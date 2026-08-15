import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bibleRouter from "./bible";
import presentationRouter from "./presentation";
import usersRouter from "./users";
import authRouter from "./auth";
import setupRouter from "./setup";
import songsRouter from "./songs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bibleRouter);
router.use(presentationRouter);
router.use(usersRouter);
router.use(authRouter);
router.use(setupRouter);
router.use(songsRouter);

export default router;
