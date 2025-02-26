import { Prisma, PrismaClient } from "@prisma/client";
import { logger } from "../logger/logger";
import { VideoSuggestion } from "../types/types";

const prisma = new PrismaClient();

export class VideoRepository {
	static async createVideo(
		userId: string,
		workspaceId: string,
		folderId: string
	) {
		return await prisma.video.create({
			data: {
				userId,
				workspaceId,
				folderId,
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
		description: string
	) {
		return await prisma.video.update({
			where: { id: videoId },
			data: {
				title,
				description,
				titleStatus: title ? "SUCCESS" : "FAILED",
				descriptionStatus: description ? "SUCCESS" : "FAILED",
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

	static async updateTranscodeStatus(videoId: string, status: boolean) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { transcodeStatus: status ? "SUCCESS" : "FAILED" },
		});
	}

	static async updateThumbnailStatus(videoId: string, status: boolean) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { thumbnailStatus: status ? "SUCCESS" : "FAILED" },
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
}
