import dayjs from "dayjs";
import { logger } from "../../logger/logger";
import prisma from "../../prismaClient";
import { sendMessage } from "../producer";
import { NOTIFICATION_EVENT_TYPE, TOPICS } from "../../config/topics";

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

export async function handleVideoViewEvent(value: VideoViewEvent) {
	logger.info("New video view event received", value);

	try {
		const video = await prisma.video.findFirst({
			where: { id: value.videoId },
		});

		if (!video || video.userId === value.userId) return;

		await prisma.$transaction(async (prisma) => {
			await prisma.views.create({
				data: {
					videoId: value.videoId,
					userId: value.userId,
					lastViewed: value.createdAt,
				},
			});

			const updatedData = await prisma.video.update({
				where: { id: value.videoId },
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
					videoId: value.videoId,
					userId: value.userId,
					eventType: NOTIFICATION_EVENT_TYPE.FIRST_VIEW,
					videoName: video?.title || "",
					viewerName: "",
					viewerId: value.userId,
				};

				sendMessage(
					TOPICS.NOTIFICATION_EVENT,
					JSON.stringify(notificationData)
				).catch((e) => {
					logger.error("🔴 Failed to send notification for first view.", {
						error: e,
					});
				});
				logger.info("✔️ First view notification sent.");
			}
		});

		logger.info("✔️ Video view successfully processed and database updated.");
	} catch (error) {
		// logger.error("Error processing video view event:", error);

		// Fallback: Increment totalViews even if uniqueViews fails
		try {
			const lastView = await prisma.views.findFirst({
				where: { videoId: value.videoId, userId: value.userId },
			});

			const now = dayjs();
			const lastViewedTime = lastView ? dayjs(lastView.lastViewed) : null;

			// If the user has not viewed the video in the last 24 hours, proceed
			if (!lastViewedTime || now.diff(lastViewedTime, "hour") < 24) return;

			await prisma.video.update({
				where: { id: value.videoId },
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
