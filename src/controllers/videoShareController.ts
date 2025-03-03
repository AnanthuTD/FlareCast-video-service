import { RequestHandler } from "express";
import prisma from "../prismaClient";
import { logger } from "../logger/logger";

export const videoShareController: RequestHandler = async (req, res) => {
	const { videoId } = req.params;
	const userId = req.user.id; // Assuming you're using a user authentication middleware
	const { spaceId = "", folderId = "" } = req.body;

	// Input validation using a utility function or could be a schema validation
	if (!videoId || !spaceId) {
		return res
			.status(400)
			.json({ message: "Video ID and Space ID are required" });
	}

	try {
		// Check if the video exists in the database
		const video = await prisma.video.findUnique({
			where: { id: videoId },
		});

		if (!video) {
			return res.status(404).json({ message: "Video not found" });
		}

		// Check if the video already exists in the target space/folder combination to avoid duplicates
		const existingVideo = await prisma.video.findFirst({
			where: {
				id: videoId, // You might want to ensure that this video doesn't already exist
			},
		});

		if (existingVideo) {
			return res
				.status(400)
				.json({ message: "Video already shared in this space/folder" });
		}

		// Create a new video record for the shared space/folder
		await prisma.video.create({
			data: {
				...video,
				spaceId: spaceId || undefined, // only assign if spaceId is present
				folderId: folderId || undefined, // only assign if folderId is present
			},
		});

		// Log successful sharing
		logger.info(
			`User ${userId} shared video ${videoId} in space ${spaceId} and folder ${folderId}`
		);

		return res.status(201).json({ message: "Video shared successfully" });
	} catch (err) {
		logger.error(`Failed to share video ${videoId}: ${err.message}`);
		return res.status(500).json({ message: "Failed to share video" });
	}
};
