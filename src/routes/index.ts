import express from "express";
import { getVideos } from "../controllers/getVideoController";
import { streamVideo } from "../controllers/streamVideo";
import { getVideoDetails } from "../controllers/getVideoDetails";
import passport from "passport";
import { videoViewController } from "../controllers/videoViewController";

const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));

router.get("/:workspaceId", getVideos);

router.get("/:videoId/video", getVideoDetails);

router.patch("/:videoId/viewed", videoViewController);

export default router;
