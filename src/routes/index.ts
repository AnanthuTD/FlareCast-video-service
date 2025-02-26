import express from "express";
import eventsController, { handleTestEvents } from "../controllers/eventController";
import protectedRoutes from "./protected"
import compression from "compression"

const router = express.Router();

router.use(compression());

router.use('/', protectedRoutes)

router.get("/test/events", handleTestEvents)
router.get(
	"/:workspaceId/events",
	eventsController
);




export default router;
