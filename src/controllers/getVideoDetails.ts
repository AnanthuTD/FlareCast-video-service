import { Request, Response } from "express";
import prisma from "../prismaClient";
import { AuthenticatedRequest } from "../types/types";

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

	const watchLater = await prisma.watchLater.findFirst({
		where: {
			userId: id,
			workspaceId: video.workspaceId,
			videoIds: { has: videoId },
		},
		select: { id: true },
	});

	res.json({ video: { ...video, watchLater } });
}
