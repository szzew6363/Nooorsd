import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import councilRouter from "./council";
import godmodeRouter from "./godmode";
import autotuneRouter from "./autotune";
import imageRouter from "./image";
import visionRouter from "./vision";
import agentRouter from "./agent";
import contextRouter from "./context";
import osintRouter from "./osint";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(councilRouter);
router.use(godmodeRouter);
router.use(autotuneRouter);
router.use(imageRouter);
router.use(visionRouter);
router.use(agentRouter);
router.use(contextRouter);
router.use(osintRouter);

export default router;
