import { Request, Response } from "express";
import { VideoRepository } from "../repository/video.repository";

export async function updateVideoTitle(req: Request, res: Response) {
	try {
		const userId = req.user.id;
		const { videoId } = req.params;
    console.log(req.body)
		const { title } = req.body;

		if (!videoId || !title) {
			res.status(400).json({ message: "Video ID and title are required" });
			return;
		}

		// TODO: Check if user has permission to edit the video
		const updated = await VideoRepository.updateTitle(title, videoId);

		if (!updated) {
			res
				.status(404)
				.json({ message: "Video not found or title update failed" });
			return;
		}

		res.status(200).json({ message: "Title updated successfully" });
	} catch (error) {
		console.error("Error updating title:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}
