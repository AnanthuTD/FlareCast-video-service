import { PrismaClient, Video } from "@prisma/client";
import { logger } from "@/infra/logger";
import {
	VideoEntity,
	VideoCategory,
	VideoStatus as DomainVideoStatus,
	VideoType as DomainVideoType,
} from "@/domain/entities/Video";
import {
	AdminDashboardState,
	AdminDashboardVideoStatus,
	IVideoRepository,
	SearchVideoData,
	VideoSuggestion,
} from "@/app/repository/IVideoRepository";

const prisma = new PrismaClient();

export class VideoRepository implements IVideoRepository {
	// Map Prisma data to VideoEntity
	private static toDomainEntity(prismaVideo: any): VideoEntity {
		return new VideoEntity({
			id: prismaVideo.id,
			title: prismaVideo.title || "",
			description: prismaVideo.description || "",
			createdAt: prismaVideo.createdAt,
			userId: prismaVideo.userId,
			totalViews: prismaVideo.totalViews || 0,
			uniqueViews: prismaVideo.uniqueViews || 0,
			transcription: prismaVideo.transcription || "",
			duration: prismaVideo.duration || "0",
			folderId: prismaVideo.folderId || "",
			workspaceId: prismaVideo.workspaceId || "",
			spaceId: prismaVideo.spaceId || "",
			category: prismaVideo.category as VideoCategory,
			type: prismaVideo.type as DomainVideoType,
			liveStreamStatus: prismaVideo.liveStreamStatus as DomainVideoStatus,
			processing: prismaVideo.processing || false,
			transcodeStatus: prismaVideo.transcodeStatus as DomainVideoStatus,
			uploaded: prismaVideo.uploaded as DomainVideoStatus,
			thumbnailStatus: prismaVideo.thumbnailStatus as DomainVideoStatus,
			transcriptionStatus: prismaVideo.transcriptionStatus as DomainVideoStatus,
			titleStatus: prismaVideo.titleStatus as DomainVideoStatus,
			descriptionStatus: prismaVideo.descriptionStatus as DomainVideoStatus,
			isPublic: prismaVideo.isPublic || false,
			user: prismaVideo.User
				? {
						id: prismaVideo.User.id,
						fullName: prismaVideo.User.fullName,
						image: prismaVideo.User.image,
				  }
				: null,
		});
	}

	// Map VideoEntity to Prisma data (for updates)
	private static toPrismaData(entity: VideoEntity): any {
		return {
			id: entity.id,
			title: entity.title,
			description: entity.description,
			createdAt: entity.createdAt,
			userId: entity.userId,
			totalViews: entity.totalViews,
			uniqueViews: entity.uniqueViews,
			transcription: entity.transcription,
			duration: entity.duration,
			folderId: entity.folderId,
			workspaceId: entity.workspaceId,
			spaceId: entity.spaceId,
			category: entity.category,
			type: entity.type,
			liveStreamStatus: entity.liveStreamStatus,
			processing: entity.processing,
			transcodeStatus: entity.transcodeStatus,
			uploaded: entity.uploaded,
			thumbnailStatus: entity.thumbnailStatus,
			transcriptionStatus: entity.transcriptionStatus,
			titleStatus: entity.titleStatus,
			descriptionStatus: entity.descriptionStatus,
			isPublic: entity.isPublic,
		};
	}

	async create(data: Partial<Video>): Promise<VideoEntity> {
		console.log(data);
		const prismaVideo = await prisma.video.create({
			...(data ? { data } : {}),
		});
		return VideoRepository.toDomainEntity(prismaVideo);
	}

	async updateTitleAndDescription(
		videoId: string,
		title: string,
		description: string,
		status: DomainVideoStatus
	): Promise<VideoEntity> {
		const prismaVideo = await prisma.video.update({
			where: { id: videoId },
			data: {
				...(title ? { title } : {}),
				...(description ? { description } : {}),
				titleStatus: status,
				descriptionStatus: status,
			},
		});
		return VideoRepository.toDomainEntity(prismaVideo);
	}

	async updateTranscription(
		videoId: string,
		transcription: string
	): Promise<VideoEntity> {
		const prismaVideo = await prisma.video.update({
			where: { id: videoId },
			data: {
				transcription,
				transcriptionStatus: transcription
					? DomainVideoStatus.SUCCESS
					: DomainVideoStatus.FAILED,
			},
		});
		return VideoRepository.toDomainEntity(prismaVideo);
	}

	async findById(videoId: string): Promise<VideoEntity | null> {
		const prismaVideo = await prisma.video.findUnique({
			where: { id: videoId },
		});
		return prismaVideo ? VideoRepository.toDomainEntity(prismaVideo) : null;
	}

	async setTranscodeStatus(
		videoId: string,
		status: DomainVideoStatus
	): Promise<VideoEntity> {
		const prismaVideo = await prisma.video.update({
			where: { id: videoId },
			data: { transcodeStatus: status },
		});
		return VideoRepository.toDomainEntity(prismaVideo);
	}

	async setThumbnailStatus(
		videoId: string,
		status: DomainVideoStatus
	): Promise<VideoEntity> {
		const prismaVideo = await prisma.video.update({
			where: { id: videoId },
			data: { thumbnailStatus: status },
		});
		return VideoRepository.toDomainEntity(prismaVideo);
	}

	async setLiveStreamStatus(
		videoId: string,
		status: DomainVideoStatus
	): Promise<VideoEntity> {
		let data: any = { liveStreamStatus: status };
		if (status === DomainVideoStatus.SUCCESS) {
			data.type = DomainVideoType.VOD; // Update type to VOD when live stream succeeds
			data.transcodeStatus = DomainVideoStatus.SUCCESS;
		}

		const prismaVideo = await prisma.video.update({
			where: { id: videoId },
			data,
		});
		return VideoRepository.toDomainEntity(prismaVideo);
	}

	async findWorkspaceIdByVideoId(videoId: string): Promise<string | null> {
		const result = await prisma.video.findUnique({
			where: { id: videoId },
			select: { workspaceId: true },
		});
		return result?.workspaceId || null;
	}

	async delete(videoId: string): Promise<void> {
		await prisma.video.delete({ where: { id: videoId } });
	}

	async updateTitle(videoId: string, title: string): Promise<VideoEntity> {
		const prismaVideo = await prisma.video.update({
			where: { id: videoId },
			data: { title },
		});
		return VideoRepository.toDomainEntity(prismaVideo);
	}

	async updateDescription(
		videoId: string,
		description: string
	): Promise<VideoEntity> {
		const prismaVideo = await prisma.video.update({
			where: { id: videoId },
			data: { description },
		});
		return VideoRepository.toDomainEntity(prismaVideo);
	}

	async searchVideo({
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
	}): Promise<SearchVideoData[]> {
		try {
			const result = await prisma.video.aggregateRaw({
				pipeline: [
					{
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
					{ $limit: limit },
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
			return result;
		} catch (error) {
			logger.error("Error while searching video", error);
			return [];
		}
	}

	async suggestVideos({
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
	private static mapVideoStatus(
		status: DomainVideoStatus
	): "processing" | "success" | "failed" {
		switch (status) {
			case DomainVideoStatus.PROCESSING:
				return "processing";
			case DomainVideoStatus.SUCCESS:
				return "success";
			case DomainVideoStatus.FAILED:
				return "failed";
			default:
				return "processing"; // Fallback
		}
	}

	async fetchAdminDashboardState(): Promise<AdminDashboardState> {
		try {
			const recentVideos = await prisma.video.findMany({
				take: 10,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					transcodeStatus: true,
					uploaded: true,
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

			const transcodingVideos: Record<string, AdminDashboardVideoStatus> = {};
			const processedVideos: Record<string, AdminDashboardVideoStatus> = {};
			const transcriptions: Record<string, AdminDashboardVideoStatus> = {};
			const titleSummaries: Record<string, AdminDashboardVideoStatus> = {};
			const thumbnails: Record<string, AdminDashboardVideoStatus> = {};

			recentVideos.forEach((video) => {
				const videoId = video.id;

				transcodingVideos[videoId] = {
					videoId,
					status: video.transcodeStatus as DomainVideoStatus,
				};

				processedVideos[videoId] = {
					videoId,
					status: video.uploaded as DomainVideoStatus,
				};

				transcriptions[videoId] = {
					videoId,
					status: video.transcriptionStatus as DomainVideoStatus,
				};

				titleSummaries[videoId] = {
					videoId,
					status: (video.titleStatus && video.descriptionStatus
						? DomainVideoStatus.SUCCESS
						: DomainVideoStatus.FAILED) as DomainVideoStatus,
				};

				thumbnails[videoId] = {
					videoId,
					status: video.thumbnailStatus as DomainVideoStatus,
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
			return {
				transcodingVideos: {},
				processedVideos: {},
				transcriptions: {},
				titleSummaries: {},
				thumbnails: {},
			};
		}
	}

	async updateVisibility(
		id: string,
		visibility: boolean
	): Promise<VideoEntity> {
		const video = await prisma.video.update({
			where: { id },
			data: { isPublic: visibility },
		});
		return VideoRepository.toDomainEntity(video);
	}

	async setPromotionalVideo(videoId: string): Promise<VideoEntity> {
		const prismaVideo = await prisma.video.update({
			where: { id: videoId },
			data: {
				category: "PROMOTIONAL",
				type: "VOD",
			},
		});
		return VideoRepository.toDomainEntity(prismaVideo);
	}

	async getVideoById(videoId: string): Promise<VideoEntity | null> {
		const prismaVideo = await prisma.video.findUnique({
			where: { id: videoId },
		});
		return prismaVideo ? VideoRepository.toDomainEntity(prismaVideo) : null;
	}

	async findPromotionalVideos(
		skip: number,
		limit: number,
		category: VideoCategory,
		isPublic: boolean = false
	): Promise<VideoEntity[]> {
		console.log("query = ", { category, ...(isPublic ? { isPublic } : {}) });
		const prismaVideos = await prisma.video.findMany({
			where: { category, ...(isPublic ? { isPublic } : {}) },
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
		});
		return prismaVideos.map((v) => VideoRepository.toDomainEntity(v));
	}

	async countPromotionalVideos({
		category = "PROMOTIONAL",
		isPublic = false,
	}: {
		category: string;
		isPublic?: boolean;
	}): Promise<number> {
		return prisma.video.count({
			where: { category, ...(isPublic ? { isPublic } : {}) },
		});
	}

	async findVideos(
		query: any,
		skip: number,
		limit: number
	): Promise<VideoEntity[]> {
		const prismaVideos = await prisma.video.findMany({
			where: query,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: { User: true },
		});
		return prismaVideos.map((v) => VideoRepository.toDomainEntity(v));
	}

	async countVideos(query: any): Promise<number> {
		return prisma.video.count({ where: query });
	}

	async createLiveStream(params: {
		userId: string;
		workspaceId: string;
		folderId?: string;
		spaceId?: string;
	}): Promise<VideoEntity> {
		const prismaVideo = await prisma.video.create({
			data: {
				type: "LIVE", // Matches Prisma's VideoType
				workspaceId: params.workspaceId,
				folderId: params.folderId || undefined,
				spaceId: params.spaceId || undefined,
				userId: params.userId,
				transcodeStatus: "SUCCESS",
			},
		});
		return VideoRepository.toDomainEntity(prismaVideo);
	}

	async updateProcessingStatus(
		videoId: string,
		status: boolean
	): Promise<VideoEntity> {
		const video = await prisma.video.update({
			where: { id: videoId },
			data: { processing: status },
		});
		return VideoRepository.toDomainEntity(video);
	}

	async update(videoId: string, data: Partial<VideoEntity>): Promise<void> {
		await prisma.video.update({
			where: { id: videoId },
			data,
		});
	}

	async findByIdAndUserId(
		videoId: string,
		userId: string
	): Promise<VideoEntity | null> {
		const video = await prisma.video.findFirst({
			where: { id: videoId, userId },
		});
		return video ? VideoRepository.toDomainEntity(video) : null;
	}

	async findManyByIds(
		videoIds: string[],
		skip: number,
		take: number
	): Promise<VideoEntity[]> {
		const videos = await prisma.video.findMany({
			where: { id: { in: videoIds } },
			skip,
			take,
			orderBy: { createdAt: "desc" },
			include: { User: true },
		});
		return videos.map((v) => VideoRepository.toDomainEntity(v));
	}

	async setDuration(videoId: string, duration: string): Promise<any> {
		return prisma.video.update({
			where: { id: videoId },
			data: { duration },
		});
	}

	async statusCount() {
		const aggregatedData = await prisma.video.aggregateRaw({
			pipeline: [
				{
					$facet: {
						totalVideos: [{ $count: "total" }],
						transcodeStatusCount: [
							{
								$group: {
									_id: "$transcodeStatus",
									count: { $sum: 1 },
								},
							},
						],
						thumbnailStatusCount: [
							{
								$group: {
									_id: "$thumbnailStatus",
									count: { $sum: 1 },
								},
							},
						],
						descriptionAndTitleStatus: [
							{
								$group: {
									_id: "$descriptionStatus",
									count: { $sum: 1 },
								},
							},
						],
						transcriptionStatusCount: [
							{
								$group: {
									_id: "$transcriptionStatus",
									count: { $sum: 1 },
								},
							},
						],
					},
				},
			],
		});

		logger.info("================= status count =================");
		console.log(aggregatedData);
		logger.info("==============================================");

		return aggregatedData;
	}

	async move({
		folderId,
		spaceId,
		videoId,
	}: {
		folderId?: string;
		spaceId?: string;
		videoId: string;
	}) {
		const setFields: Record<string, any> = {};
		const unsetFields: Record<string, any> = {};

		if (folderId) {
			setFields.folderId = { $oid: folderId };
		} else if (spaceId) {
			setFields.spaceId = { $oid: spaceId };
			unsetFields.folderId = "";
		} else {
			unsetFields.folderId = "";
			unsetFields.spaceId = "";
		}

		const updateOperation: Record<string, any> = {};
		if (Object.keys(setFields).length) updateOperation["$set"] = setFields;
		if (Object.keys(unsetFields).length)
			updateOperation["$unset"] = unsetFields;

		console.log("Mongo Update:", updateOperation);

		const result = await prisma.$runCommandRaw({
			update: "Video",
			updates: [
				{
					q: { _id: { $oid: videoId } },
					u: updateOperation,
				},
			],
		});

		console.log(result);
	}
}
