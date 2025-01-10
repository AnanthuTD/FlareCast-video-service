import express from "express";
import { getVideos } from "../controllers/getVideoController";

const router = express.Router();

router.get("/videos", getVideos)

export default router;
