import { Response } from "express";
import prisma from "../prismaClient";
import { AuthenticatedRequest } from "../types/types";

export async function getVideos(req: AuthenticatedRequest, res: Response) {
	const { id } = req.user;
	let { skip = "0", limit = "0" } = req.query || {};

	const skipNum = Math.max(parseInt(skip as string, 10) || 0, 0);
	const limitNum = Math.max(parseInt(limit as string, 10) || 10, 1);

	const videos = await prisma.video.findMany({
		where: { userId: id },
		skip: skipNum,
		take: limitNum,
		orderBy: { createdAt: "desc" },
	});

	const totalCount = await prisma.video.count({ where: { userId: id } });
	const remainingCount = Math.max(totalCount - (skipNum + videos.length), 0);

	res.json({ videos, totalCount, remainingCount });
}
