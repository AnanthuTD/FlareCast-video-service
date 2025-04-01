import {
	PrismaClient,
	VideoStatus as PrismaVideoStatus,
	VideoType,
} from "@prisma/client";
import { logger } from "../logger/logger";
import {
	AdminDashboardState,
	VideoStatus,
	VideoSuggestion,
} from "../types/types";

const prisma = new PrismaClient();

export class VideoRepository {
	static async createVideo(
		userId: string,
		workspaceId: string,
		folderId?: string,
		spaceId?: string
	) {
		return await prisma.video.create({
			data: {
				userId,
				workspaceId: workspaceId || undefined,
				folderId: folderId || undefined,
				spaceId: spaceId || undefined,
			},
		});
	}

	static async updateProcessingStatus(videoId: string, status: boolean) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { processing: status },
		});
	}

	static async updateTitleAndDescription(
		videoId: string,
		title: string,
		description: string,
		status: VideoStatus["status"]
	) {
		return await prisma.video.update({
			where: { id: videoId },
			data: {
				...(title ? { title } : {}),
				...(description ? { description } : {}),
				titleStatus: status,
				descriptionStatus: status,
			},
		});
	}

	static async updateTranscription(videoId: string, transcription: string) {
		return await prisma.video.update({
			where: { id: videoId },
			data: {
				transcription,
				transcriptionStatus: transcription ? "SUCCESS" : "FAILED",
			},
		});
	}

	static async getVideoById(videoId: string) {
		return await prisma.video.findUnique({
			where: { id: videoId },
		});
	}

	static async updateTranscodeStatus(
		videoId: string,
		status: VideoStatus["status"]
	) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { transcodeStatus: status },
		});
	}

	static async updateThumbnailStatus(
		videoId: string,
		status: VideoStatus["status"]
	) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { thumbnailStatus: status },
		});
	}

	static async updateLiveStreamStatus(
		videoId: string,
		status: VideoStatus["status"]
	) {
		let data = { liveStreamStatus: status };
		if (status === "SUCCESS") {
			data.type = VideoType.VOD;
			data.transcodeStatus = PrismaVideoStatus.SUCCESS;
		}

		return await prisma.video.update({
			where: { id: videoId },
			data,
		});
	}

	static async getVideoWorkspaceId(videoId: string) {
		return await prisma.video.findUnique({
			where: { id: videoId },
			select: { workspaceId: true },
		});
	}

	static async deleteVideo(videoId: string) {
		return await prisma.video.delete({ where: { id: videoId } });
	}

	static async updateTitle(title: string, videoId: string) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { title },
		});
	}

	static async updateDescription(description: string, videoId: string) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { description },
		});
	}

	/*
	 * search for video based on title and description. Uses atlas search
	 * returns the title, description, score, paginationToken
	 */
	static async searchVideo({
		query = "",
		limit = 1,
		direction = "searchAfter",
		paginationToken,
		workspaceId = "",
	}: {
		query: string;
		limit: number;
		direction: "searchAfter" | "searchBefore";
		paginationToken?: string;
		workspaceId?: string;
	}) {
		try {
			return await prisma.video.aggregateRaw({
				pipeline: [
					{
						$search: {
							index: "videoTitleDescSearch",
							compound: {
								must: [
									{
										equals: {
											path: "workspaceId",
											value: {
												$oid: workspaceId,
											},
										},
									},
									{
										$text: {
											query,
											path: ["title", "description"],
										},
									},
								],
							},
							[direction]: paginationToken,
						},
					},
					{
						$limit: limit,
					},
					{
						$project: {
							title: true,
							description: true,
							paginationToken: { $meta: "searchSequenceToken" },
							score: { $meta: "searchScore" },
						},
					},
				],
			});
		} catch (error) {
			logger.error("error while searching video", error);
			return [];
		}
	}

	/*
	 * Autocomplete. Uses atlas search
	 * only for title
	 */
	static async suggestVideos({
		query = "",
		limit = 5,
		workspaceId = "",
		paginationToken,
		direction,
	}: {
		query: string;
		limit: number;
		workspaceId?: string;
		direction: "searchAfter" | "searchBefore";
		paginationToken?: string;
	}): Promise<VideoSuggestion[]> {
		if (!query.trim() || !workspaceId) return [];

		const searchStage: any = {
			$search: {
				index: "videoTitleDescSearch",
				compound: {
					must: [
						{
							equals: {
								path: "workspaceId",
								value: { $oid: workspaceId },
							},
						},
						{
							autocomplete: {
								query,
								path: "title",
								tokenOrder: "any",
								fuzzy: { maxEdits: 1 },
							},
						},
					],
				},
			},
		};

		if (paginationToken) {
			searchStage.$search[direction] = paginationToken;
		}

		try {
			const suggestions = await prisma.video.aggregateRaw({
				pipeline: [
					searchStage,
					{ $limit: limit },
					{
						$lookup: {
							from: "User",
							localField: "userId",
							foreignField: "_id",
							as: "user",
						},
					},
					{ $unwind: "$user" },
					{
						$project: {
							title: 1,
							createdAt: { $toString: "$createdAt" },
							id: { $toString: "$_id" },
							score: { $meta: "searchScore" },
							user: {
								id: "$user._id",
								name: "$user.fullName",
							},
							paginationToken: { $meta: "searchSequenceToken" },
						},
					},
				],
			});

			return suggestions as unknown as VideoSuggestion[];
		} catch (error) {
			logger.error("Error while suggesting video", error);
			throw new Error("Failed to fetch video suggestions");
		}
	}

	// Map Prisma VideoStatus to dashboard status
	static mapVideoStatus = (
		status: VideoStatus["status"]
	): "processing" | "success" | "failed" => {
		switch (status) {
			case "PROCESSING":
				return "processing";
			case "SUCCESS":
				return "success";
			case "FAILED":
				return "failed";
			default:
				return "processing"; // Fallback
		}
	};

	static getInitialData = async (): Promise<AdminDashboardState> => {
		try {
			// Fetch recent videos for processing statuses
			const recentVideos = await prisma.video.findMany({
				take: 10, // Limit to recent for performance
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					transcodeStatus: true,
					uploaded: true, // Assuming this is "processed" status
					thumbnailStatus: true,
					transcriptionStatus: true,
					titleStatus: true,
					descriptionStatus: true,
					transcription: true,
					title: true,
					description: true,
					duration: true,
				},
			});

			// Process video data into dashboard state
			const transcodingVideos: Record<string, VideoStatus> = {};
			const processedVideos: Record<string, VideoStatus> = {};
			const transcriptions: Record<string, VideoStatus> = {};
			const titleSummaries: Record<string, VideoStatus> = {};
			const thumbnails: Record<string, VideoStatus> = {};

			recentVideos.forEach((video) => {
				const videoId = video.id;

				// Transcoding
				transcodingVideos[videoId] = {
					videoId,
					status: video.transcodeStatus,
				};

				// Processed (uploaded)
				processedVideos[videoId] = {
					videoId,
					status: video.uploaded,
				};

				// Transcription
				transcriptions[videoId] = {
					videoId,
					status: video.transcriptionStatus,
					transcription: video.transcription || undefined,
				};

				// Title and Summary
				titleSummaries[videoId] = {
					videoId,
					status:
						video.titleStatus && video.descriptionStatus ? "SUCCESS" : "FAILED",
					title: video.title || undefined,
					description: video.description || undefined,
				};

				// Thumbnail
				thumbnails[videoId] = {
					videoId,
					status: video.thumbnailStatus,
					duration: video.duration || undefined,
				};
			});

			return {
				transcodingVideos,
				processedVideos,
				transcriptions,
				titleSummaries,
				thumbnails,
			};
		} catch (error) {
			console.error("Error fetching initial data:", error);
			// Return empty state on error to avoid crashing
			return {
				transcodingVideos: {},
				processedVideos: {},
				transcriptions: {},
				titleSummaries: {},
				thumbnails: {},
			};
		}
	};
}
