import { Request, Response } from "express";
import prisma from "../prismaClient";
import { AuthenticatedRequest } from "../types/types";
import env from "../env";

export async function getVideos(req: Request, res: Response) {
	const { id } = (req as AuthenticatedRequest).user;
	let { skip = "0", limit = "0" } = req.query || {};

	const skipNum = Math.max(parseInt(skip as string, 10) || 0, 0);
	const limitNum = Math.max(parseInt(limit as string, 10) || 10, 1);

	const videos = await prisma.video.findMany({
		where: { userId: id },
		skip: skipNum,
		take: limitNum,
		orderBy: { createdAt: "desc" },
	});

	const videosWithThumbnail = videos.map((v) => ({
		...v,
		thumbnailUrl: `${env.GCS_PUBLIC_URL}/${v.id}/thumbnails/thumb0001.jpg`,
		views: 5,
		comments: 6,
		duration: "4 min",
		shares: 10,
		userName: "Moksh Garg",
		timeAgo: "2mo",
		userAvatarUrl: "/vercel.svg",
	}));

	const totalCount = await prisma.video.count({ where: { userId: id } });
	const remainingCount = Math.max(totalCount - (skipNum + videos.length), 0);

	res.json({ videos: videosWithThumbnail, totalCount, remainingCount });
}
