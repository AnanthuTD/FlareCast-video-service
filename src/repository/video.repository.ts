import { Prisma, PrismaClient } from "@prisma/client";
import { logger } from "../logger/logger";

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
	static async suggestVideo({
		query = "",
		limit = 1,
		workspaceId = "",
	}: {
		query: string;
		limit: number;
		workspaceId?: string;
	}) {
		try {
			const suggestions = await prisma.video.aggregateRaw({
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
										autocomplete: {
											query: query,
											path: "title",
											tokenOrder: "sequential",
										},
									},
								],
							},
						},
					},
					{ $limit: limit },
					{
						$lookup: {
							from: "User",
							localField: "userId",
							foreignField: "_id",
							as: "user",
						},
					},
					{
						$unwind: "$user",
					},
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
						},
					},
				],
			});

			return suggestions;
		} catch (error) {
			logger.error("error while suggesting video", error);
			return [];
		}
	}
}
