import express from "express";
import { getVideos } from "../controllers/getVideoController";
import { streamVideo } from "../controllers/streamVideo";
import { getVideoDetails } from "../controllers/getVideoDetails";

const router = express.Router();

router.get("/videos", getVideos)

router.get('/stream/:file', streamVideo);

router.get('/:videoId/video', getVideoDetails);

export default router;
