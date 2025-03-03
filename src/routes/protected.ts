import express from "express";
import { getVideos } from "../controllers/getVideoController";
import { getVideoDetails } from "../controllers/getVideoDetails";
import passport from "passport";
import { videoViewController } from "../controllers/videoViewController";
import { updateVideoTitle } from "../controllers/updateTitle";
import { updateVideoDescription } from "../controllers/updateDescription";
import { searchVideosController } from "../controllers/searchVideosController";
import { autocompleteSearchVideosController } from "../controllers/autocompleteController";
import { WatchLaterController } from "../controllers/watchlater.controller";
import {
	getChats,
	handleChat,
	handleClearChatHistory,
} from "../controllers/aiAgent.controller";
import { VideoEditController } from "../controllers/videoEdit.controller";

const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));

router.get("/upload-presigned-url", VideoEditController.generatePresignedUrl);

router.get("/search", searchVideosController);
router.get("/search/autocomplete", autocompleteSearchVideosController);

router.post("/watch-later", WatchLaterController.add);
router.delete("/:videoId/watch-later", WatchLaterController.remove);
router.get("/watch-later", WatchLaterController.get);

router.get("/:workspaceId", getVideos);

router.get("/:videoId/video", getVideoDetails);

router.patch("/:videoId/viewed", videoViewController);

router.put("/:videoId/update/title", updateVideoTitle);
router.put("/:videoId/update/description", updateVideoDescription);

router.post("/chat", handleChat);
router.post("/chat/clear-session", handleClearChatHistory);
router.get("/chats/:videoId", getChats);

export default router;
