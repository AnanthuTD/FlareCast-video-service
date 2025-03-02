import { Request, Response } from "express";
import prisma from "../prismaClient";
import { AuthenticatedRequest } from "../types/types";
import env from "../env";
import { Prisma } from "@prisma/client";

export async function getVideos(req: Request, res: Response) {
	try {
		const { id } = (req as AuthenticatedRequest).user;
		const { workspaceId } = req.params;
		const { skip = "0", limit = "10", folderId = "", spaceId = "" } = req.query;

		// Validate workspaceId
		if (!workspaceId || typeof workspaceId !== "string") {
			return res.status(400).json({
				message: "Workspace ID is required as a URL parameter",
			});
		}

		// Parse and validate pagination parameters
		const skipNum = Math.max(parseInt(skip as string, 10) || 0, 0);
		const limitNum = Math.max(parseInt(limit as string, 10) || 10, 1);

		// Build query with conditional filters
		const query: Prisma.VideoWhereInput = {
			workspaceId,
			folderId: folderId ? (folderId as string) : undefined,
			spaceId: folderId ? undefined : (spaceId as string) || undefined,
		};

		// Fetch videos
		const videos = await prisma.video.findMany({
			where: query,
			skip: skipNum,
			take: limitNum,
			orderBy: { createdAt: "desc" },
			include: { User: true },
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
			userName: v.User?.fullName ?? "Unknown User",
			timeAgo: getTimeAgo(v.createdAt),
			userAvatarUrl: v.User?.image ?? null,
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
}

export function getVideoDurationFormatted(durationInSeconds: string): string {
	const duration = parseFloat(durationInSeconds);
	const hours = Math.floor(duration / 3600);
	const minutes = Math.floor((duration % 3600) / 60);
	const seconds = Math.round(duration % 60);

	return `${hours > 0 ? `${hours}h ` : ""}${
		minutes > 0 ? `${minutes}m` : ""
	} ${seconds}s`;
}

export function getTimeAgo(createdAt: Date) {
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
