import { VideoStatus } from "@prisma/client";
import { handleVideoStatusUpdateEvent } from "../../controllers/eventController";
import { logger } from "../../logger/logger";
import prisma from "../../prismaClient";
import { VideoRepository } from "../../repository/video.repository";
import eventEmitter from "../../eventEmitter";
import EventName from "../../eventEmitter/eventNames";

export async function handleThumbnailEvent(value: {
	videoId: string;
	status: VideoStatus;
	duration: string;
}) {
	logger.info(
		`⌛ New thumbnail event received, status: ${
			value.status ? "🟢 success" : "🔴 failed"
		}`,
		value
	);

	if (!value.status) {
		logger.info(
			"🟡 Skipping thumbnail update for video\t" +
				JSON.stringify({ videoId: value.videoId })
		);
		return;
	}

	try {
		logger.info(
			`⌛ Updating thumbnail status for video: ${JSON.stringify(
				value,
				null,
				2
			)}`
		);

		eventEmitter.emit(EventName.THUMBNAIL, {
			videoId: value.videoId,
			status: value.status,
			duration: value.status !== VideoStatus.SUCCESS ? value.duration : undefined,
		});

		await VideoRepository.updateThumbnailStatus(
			value.videoId,
			value.status
		);

		await handleVideoStatusUpdateEvent({
			videoId: value.videoId,
			status: value.status,
			message: "Thumbnail processed successfully",
			event: "thumbnail-update",
		});

		await prisma.video.update({
			where: { id: value.videoId },
			data: {
				duration: value.duration,
			},
		});

		logger.info("✅ Thumbnail status updated successfully!");
	} catch (error) {
		logger.error(
			`🔴 Error updating thumbnail status for video ${value.videoId}`,
			{ error }
		);
	}
}
