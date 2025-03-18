import express from "express";
import { handleTestEvents } from "../controllers/eventController";
import compression from "compression";
import { createPromotionalVideo } from "../controllers/createPromotionalVideo.controller";

const router = express.Router();

router.use(compression());

router.get("/get", handleTestEvents);
router.post("/promotional-video", createPromotionalVideo);

export default router;
