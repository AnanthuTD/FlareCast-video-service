import express from "express";
import { getVideos } from "../controllers/getVideoController";
import { getVideoDetails } from "../controllers/getVideoDetails";
import passport from "passport";
import { videoViewController } from "../controllers/videoViewController";
import { updateVideoTitle } from "../controllers/updateTitle";
import { updateVideoDescription } from "../controllers/updateDescription";
import { searchVideosController } from "../controllers/searchVideosController";
import { autocompleteSearchVideosController } from "../controllers/autocompleteController";

const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));

router.get("/search", searchVideosController)
router.get("/search/autocomplete", autocompleteSearchVideosController)

router.get("/:workspaceId", getVideos);

router.get("/:videoId/video", getVideoDetails);

router.patch("/:videoId/viewed", videoViewController);

router.put("/:videoId/update/title", updateVideoTitle)
router.put("/:videoId/update/description", updateVideoDescription)


export default router;
