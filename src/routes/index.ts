import express from "express";
import { getVideos } from "../controllers/getVideoController";
import { streamVideo } from "../controllers/streamVideo";
import { getVideoDetails } from "../controllers/getVideoDetails";
import passport from "passport";

const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));

router.get("/videos", getVideos);

router.get("/stream/:file", streamVideo);

router.get("/:videoId/video", getVideoDetails);

router.get("/video/:videoId/viewed");

export default router;
