import express from "express";
import eventsController, {
	handleTestEvents,
} from "../controllers/eventController";
import protectedRoutes from "./protected";
import compression from "compression";
import { getPreviewVideoDetails } from "../controllers/getVideoDetails";

const router = express.Router();

router.use(compression());

router.get("/test/events", handleTestEvents);
router.get("/:workspaceId/events", eventsController);

router.get("/:videoId/preview", getPreviewVideoDetails);

router.use("/", protectedRoutes);

export default router;
