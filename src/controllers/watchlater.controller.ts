import { Request, Response } from "express";
import prisma from "../prismaClient";
import { WatchLaterRepository } from "../repository/watchLater.repository";
import env from "../env";
import { getTimeAgo, getVideoDurationFormatted } from "./getVideoController";

export class WatchLaterController {
	static async add(req: Request, res: Response) {
		try {
			const { videoId } = req.body;
			const userId = req.user.id;

			// Validate input
			if (!videoId) {
				res.status(400).json({ message: "Video ID is required" });
				return;
			}

			// Check if video exists and get workspaceId
			const video = await prisma.video.findUnique({
				where: { id: videoId },
				select: { workspaceId: true },
			});

			if (!video) {
				res.status(404).json({ message: "Video not found" });
				return;
			}

			const watchLater = await WatchLaterRepository.add({
				videoId,
				userId,
				workspaceId: video.workspaceId,
			});

			res.status(201).json({
				message: "Video added to watch later successfully",
        watchLater,
			});
			return;
		} catch (error) {
			res.status(500).json({
				message: error.message || "Failed to add video to watch later",
			});
			return;
		}
	}

	static async get(req: Request, res: Response) {
		try {
			const userId = req.user.id;
			let { workspaceId, page = "1", limit = "10" } = req.query;

			if (!workspaceId || typeof workspaceId !== "string") {
				return res.status(400).json({
					message: "Workspace ID is required as a query parameter",
				});
			}

			// Parse and validate pagination parameters
			const pageNum = parseInt(page as string, 10) || 1;
			const take = parseInt(limit as string, 10) || 10;
			if (pageNum < 1 || take < 1) {
				return res.status(400).json({
					message: "Page and pageSize must be positive integers",
				});
			}
			const skip = (pageNum - 1) * take;

			// Fetch watch later video IDs
			const watchLater = await prisma.watchLater.findFirst({
				where: { userId, workspaceId },
				select: { videoIds: true },
			});

			if (!watchLater?.videoIds.length) {
				return res.status(200).json({
					videos: [],
					totalCount: 0,
					page: pageNum,
					pageSize: limit,
					totalPages: 0,
					hasNext: false,
					hasPrev: false,
				});
			}

			// Fetch paginated videos from the watch later list
			const videos = await prisma.video.findMany({
				where: { id: { in: watchLater.videoIds } },
				skip,
				take,
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
			const totalCount = watchLater.videoIds.length;
			const totalPages = Math.ceil(totalCount / limit);
			const hasNext = skip + videos.length < totalCount;
			const hasPrev = pageNum > 1;

			return res.status(200).json({
				videos: videosWithThumbnail,
				totalCount,
				page: pageNum,
				pageSize: limit,
				totalPages,
				hasNext,
				hasPrev,
			});
		} catch (error) {
			return res.status(500).json({
				message: error.message || "Failed to get watch later videos",
			});
		}
	}

	static async remove(req: Request, res: Response) {
		try {
			const { videoId } = req.params;
			const userId = req.user.id;

			if (!videoId) {
				res.status(400).json({
					message: "Video ID is required",
				});
				return;
			}

			// Check if video exists and get workspaceId
			const video = await prisma.video.findUnique({
				where: { id: videoId },
				select: { workspaceId: true },
			});

			if (!video) {
				res.status(404).json({
					message: "Video not found",
				});
				return;
			}

			const watchLater = await WatchLaterRepository.remove({
				videoId,
				userId,
				workspaceId: video.workspaceId,
			});

			res.status(200).json({
				message: "Video removed from watch later successfully",
        watchLater
			});
		} catch (error) {
			res.status(500).json({
				message: error.message || "Failed to remove video from watch later",
			});
		}
	}
}
