import { TOPICS } from "../config/topics";
import { logger } from "../logger/logger";
import prisma from "../prismaClient";
import { createTopic } from "./admin";
import { consumeMessages } from "./consumer";
import { sendMessage } from "./producer";

enum NOTIFICATION_EVENT_TYPE {
	FIRST_VIEW = "firstView",
}

interface VideoViewEvent {
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

interface UserVerifiedEvent {
	userId: string;
	email: string;
	firstName: string;
}

createTopic([TOPICS.VIDEO_EVENTS]).then(() => {
	logger.info("✅ Topic created successfully");
	// Consume messages for USER_VERIFIED_EVENT
	/* consumeMessages(
		[TOPICS.USER_VERIFIED_EVENT],
		async (value: UserVerifiedEvent) => {
			logger.info("New verified user data received", value);

			try {
				await prisma.user.create({
					data: {
						userId: value.userId,
						email: value.email,
						username: value.firstName,
					},
				});
			} catch (error) {
				logger.error("Error creating user:", error);
			}
		}
	); */

	// Consume messages for VIDEO_VIEW_EVENT
	consumeMessages([TOPICS.VIDEO_VIEW_EVENT], async (value: VideoViewEvent) => {
		logger.info("New video view event received", value);

		try {
			await prisma.$transaction(async (prisma) => {
				await prisma.views.create({
					data: {
						videoId: value.videoId,
						userId: value.userId,
						createdAt: value.createdAt,
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
						videoName: "",
						viewerName: "",
						viewerId: value.userId,
					};

					sendMessage(
						TOPICS.NOTIFICATION_EVENT,
						JSON.stringify(notificationData)
					).catch((e) => {
						logger.error("Failed to send notification for first view.", {
							error: e,
						});
					});
					logger.info("First view notification sent.");
				}
			});

			logger.info("Video view successfully processed and database updated.");
		} catch (error) {
			logger.error("Error processing video view event:", error);

			// Fallback: Increment totalViews even if uniqueViews fails
			try {
				await prisma.video.update({
					where: { id: value.videoId },
					data: {
						totalViews: {
							increment: 1,
						},
					},
				});
				logger.warn("Fallback: Total views incremented after initial failure.");
			} catch (fallbackError) {
				logger.error(
					"Fallback error: Failed to increment total views:",
					fallbackError
				);
			}
		}
	});
});
