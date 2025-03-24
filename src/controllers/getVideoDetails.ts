import { Request, Response } from "express";
import prisma from "../prismaClient";
import { AuthenticatedRequest } from "../types/types";
import env from "../env";
import axios from "axios";
import { logger } from "../logger/logger";

export async function getVideoDetails(req: Request, res: Response) {
	const { id } = (req as AuthenticatedRequest).user;
	const { videoId } = req.params;

	const video = await prisma.video.findFirst({
		where: {
			id: videoId,
			// userId: id,
		},
	});

	if (!video) {
		res.status(404).json({ message: "Video not found", video: null });
		return;
	}

	if (!video.isPublic && video.userId !== id) {
		if (!video.spaceId) {
			logger.debug("Video is not public and user is not the owner");
			res
				.status(403)
				.json({ message: "User don't have access rights to this video" });
			return;
		}
		try {
			const { data } = await axios.get(
				`${env.COLLABORATION_API_URL}/permissions/${video.spaceId}/space/${id}/isMember`
			);

			if (!data.isMember) {
				logger.debug("User is not a member of the space and has permission");
				res
					.status(403)
					.json({ message: "User don't have access rights to this video" });
			}
		} catch (err) {
			logger.error(`Error checking user permission: ${err?.response?.message}`);
			console.log(err);
			res.status(500).json({ message: "Failed to check user permission" });
			return;
		}
	}

	const watchLater = await prisma.watchLater.findFirst({
		where: {
			userId: id,
			workspaceId: video.workspaceId ?? undefined,
			videoIds: { has: videoId },
		},
		select: { id: true },
	});

	res.json({ video: { ...video, watchLater } });
}

export async function getPreviewVideoDetails(req: Request, res: Response) {
	const { videoId } = req.params;
	// const userId = (req as AuthenticatedRequest).user.id;

	const video = await prisma.video.findFirst({
		where: {
			id: videoId,
		},
	});

	if (!video) {
		res.status(404).json({ message: "Video not found", video: null });
		return;
	}

	/* if (!video.isPublic && video.userId !== userId) {
		if (!video.spaceId) {
			logger.debug("Video is not public and user is not the owner");
			res
				.status(403)
				.json({ message: "User don't have access rights to this video" });
			return;
		}
		try {
			const { data } = await axios.get(
				`${env.COLLABORATION_API_URL}/permissions/${video.spaceId}/space/${userId}/isMember`
			);

			if (!data.isMember) {
				logger.debug("User is not a member of the space and has permission");
				res
					.status(403)
					.json({ message: "User don't have access rights to this video" });
			}
		} catch (err) {
			logger.error(`Error checking user permission: ${err?.response?.message}`);
			console.log(err);
			res.status(500).json({ message: "Failed to check user permission" });
			return;
		}
	} */

	res.json({ video: { ...video } });
}
