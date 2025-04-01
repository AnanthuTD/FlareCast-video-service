import express from "express";
import { handleTestEvents } from "../controllers/eventController";
import compression from "compression";
import { createPromotionalVideo } from "../controllers/createPromotionalVideo.controller";
import { getVideoDetails } from "../controllers/interservice/videoDetails";

const router = express.Router();

router.use(compression());

router.get("/get", handleTestEvents);
router.post("/promotional-video", createPromotionalVideo);
router.get("/video", getVideoDetails)
export default router;
