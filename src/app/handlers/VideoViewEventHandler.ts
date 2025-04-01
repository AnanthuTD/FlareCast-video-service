import { logger } from "@/infra/logger";
import { IEventHandler } from "../interfaces/IEventHandler";
import { IVideoRepository } from "../repository/IVideoRepository";
import { ILocalEventEmitter } from "../providers/ILocalEventEmitter";
import { ISSEService } from "../services/ISSEService";
import prisma from "@/infra/databases/prisma/connection";
import { IEventService } from "../services/IEventService";
import dayjs from "dayjs";
import { TOPICS } from "@/infra/kafka/topics";
import { VideoStatus } from "@/domain/entities/Video";

export interface VideoViewEvent {
	videoId: string;
	userId: string;
	createdAt: Date;
}

export interface NotificationEvent {
	eventType: string;
	userId: string;
	videoName: string;
	videoId: string;
	viewerName: string;
	viewerId: string;
}

export class VideoViewEventHandler implements IEventHandler {
	constructor(
		private readonly videoRepository: IVideoRepository,
		private readonly sse: ISSEService,
		private readonly eventEmitter: ILocalEventEmitter,
		private readonly eventService: IEventService
	) {}

	async handle(topic: string, data: VideoViewEvent): Promise<void> {
		try {
			const video = await this.videoRepository.findById(data.videoId);

			if (!video) {
				logger.error("🔴 Video not found", { videoId: data.videoId });
				return;
			}

			if (video.userId === data.userId) {
				logger.error("❕skipping view count update.", {
					videoId: data.videoId,
				});
				return;
			}

			if (video.transcriptionStatus === VideoStatus.SUCCESS) {
				logger.info(
					"🟡 Skipping transcription update for video\t" + JSON.stringify(data)
				);
				return;
			}

			await prisma.$transaction(async (prisma) => {
				await prisma.views.create({
					data: {
						videoId: data.videoId,
						userId: data.userId,
						lastViewed: data.createdAt,
					},
				});

				const updatedData = await prisma.video.update({
					where: { id: data.videoId },
					data: {
						totalViews: {
							increment: 1,
						},
						uniqueViews: {
							increment: 1,
						},
					},
				});

				if (updatedData.totalViews === 1) {
					const notificationData: NotificationEvent = {
						videoId: data.videoId,
						userId: data.userId,
						eventType: TOPICS.FIRST_VIEW,
						videoName: video?.title || "",
						viewerName: "",
						viewerId: data.userId,
					};

					this.eventService.publishVideoFirstViewEvent(notificationData);
					logger.info("✔️ First view notification sent.");
				}
			});

			logger.info("✔️ Video view successfully processed and database updated.");
		} catch (error) {
			// logger.error("Error processing video view event:", error);

			// Fallback: Increment totalViews even if uniqueViews fails
			try {
				const lastView = await prisma.views.findFirst({
					where: { videoId: data.videoId, userId: data.userId },
				});

				const now = dayjs();
				const lastViewedTime = lastView ? dayjs(lastView.lastViewed) : null;

				// If the user has not viewed the video in the last 24 hours, proceed
				if (!lastViewedTime || now.diff(lastViewedTime, "hour") < 24) return;

				await prisma.video.update({
					where: { id: data.videoId },
					data: {
						totalViews: {
							increment: 1,
						},
					},
				});
				// logger.warn("Fallback: Total views incremented after initial failure.");
			} catch (fallbackError) {
				logger.error(
					"🔴 Fallback error: Failed to increment total views:",
					fallbackError
				);
			}
		}
	}
}
