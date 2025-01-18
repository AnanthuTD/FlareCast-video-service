import { Request, Response } from "express";
import prisma from "../prismaClient";
import { AuthenticatedRequest } from "../types/types";

export async function getVideoDetails(req: Request, res: Response) {
	const { id } = (req as AuthenticatedRequest).user;
	const { videoId } = req.params;

	const video = await prisma.video.findFirst({
		where: {
			id: videoId,
			userId: id,
		},
	});

	res.json({ video });
}
