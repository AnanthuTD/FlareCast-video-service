import { Request, RequestHandler, Response } from "express";
import prisma from "../prismaClient";
import env from "../env";
import { Prisma, VideoCategory } from "@prisma/client";
import { getTimeAgo, getVideoDurationFormatted } from "./getVideoController";

export const getPromotionalVideos: RequestHandler = async (
	req: Request,
	res: Response
) => {
	try {
		const { skip = "0", limit = "10" } = req.query;

		// Parse and validate pagination parameters
		const skipNum = Math.max(parseInt(skip as string, 10) || 0, 0);
		const limitNum = Math.max(parseInt(limit as string, 10) || 10, 1);

		const query: Prisma.VideoWhereInput = {
			category: VideoCategory.PROMOTIONAL,
		};
		// Fetch videos
		const videos = await prisma.video.findMany({
			where: query,
			skip: skipNum,
			take: limitNum,
			orderBy: { createdAt: "desc" },
			select: {
				totalViews: true,
				createdAt: true,
				uniqueViews: true,
				duration: true,
				id: true,
			},
		});

		// Enrich video data
		const videosWithThumbnail = videos.map((v) => ({
			...v,
			thumbnailUrl: `${env.AWS_CLOUDFRONT_URL}/${v.id}/thumbnails/thumb00001.jpg`,
			views: v.totalViews ?? 0,
			uniqueViews: v.uniqueViews ?? 0,
			comments: 6, // Replace with actual data if available
			duration: getVideoDurationFormatted(v.duration),
			shares: 10, // Replace with actual data if available
			userName: "Admin",
			timeAgo: getTimeAgo(v.createdAt),
			userAvatarUrl: null,
		}));

		// Calculate pagination metadata
		const totalCount = await prisma.video.count({ where: query });
		const totalPages = Math.ceil(totalCount / limitNum);
		const hasNext = skipNum + videos.length < totalCount;
		const hasPrev = skipNum > 0;

		// Response
		return res.status(200).json({
			videos: videosWithThumbnail,
			totalCount,
			page: Math.floor(skipNum / limitNum) + 1,
			pageSize: limitNum,
			totalPages,
			hasNext,
			hasPrev,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message || "Failed to get videos",
		});
	}
};
