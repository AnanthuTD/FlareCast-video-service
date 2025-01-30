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
		include: {
			User: true,
		},
	});

	const videosWithThumbnail = videos.map((v) => ({
		...v,
		thumbnailUrl: `${env.AWS_CLOUDFRONT_URL}/${v.id}/thumbnails/thumb00001.jpg`,
		views: v.totalViews ?? 0,
		uniqueViews: v.uniqueViews ?? 0,
		comments: 6,
		duration: getVideoDurationFormatted(v.duration),
		shares: 10,
		userName: v.User?.fullName ?? "Unknown User",
		timeAgo: getTimeAgo(v.createdAt),
		userAvatarUrl: v.User?.image ?? null,
	}));

	const totalCount = await prisma.video.count({ where: { userId: id } });
	const remainingCount = Math.max(totalCount - (skipNum + videos.length), 0);

	res.json({ videos: videosWithThumbnail, totalCount, remainingCount });
}

function getVideoDurationFormatted(durationInSeconds: string): string {
	const duration = parseFloat(durationInSeconds);
	const hours = Math.floor(duration / 3600);
	const minutes = Math.floor((duration % 3600) / 60);
	const seconds =  Math.round(duration % 60);

	return `${hours > 0 ? `${hours}h ` : ""}${
		minutes > 0 ? `${minutes}m` : ""
	} ${seconds}s`;
}

function getTimeAgo(createdAt: Date) {
	const diff = new Date().getTime() - createdAt.getTime();
	const seconds = Math.round(Math.floor(diff / 1000));
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `${days}d`;
	} else if (hours > 0) {
		return `${hours}h`;
	} else if (minutes > 0) {
		return `${minutes}m`;
	} else {
		return `${seconds}s`;
	}
}
