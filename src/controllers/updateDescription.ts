import { Request, Response } from "express";
import { VideoRepository } from "../repository/video.repository";

export async function updateVideoDescription(req: Request, res: Response) {
	try {
		const userId = req.user.id;
		const { videoId } = req.params;
		const { description } = req.body;

		if (!videoId || !description) {
			res
				.status(400)
				.json({ message: "Video ID and description are required" });
			return;
		}

		// TODO: Check if user has permission to edit the video
		const updated = await VideoRepository.updateDescription(
			description,
			videoId
		);

		if (!updated) {
			res
				.status(404)
				.json({ message: "Video not found or description update failed" });
			return;
		}

		res.status(200).json({ message: "Description updated successfully" });
	} catch (error) {
		console.error("Error updating description:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}
