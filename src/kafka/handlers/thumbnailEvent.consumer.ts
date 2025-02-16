import { handleVideoStatusUpdateEvent } from "../../controllers/eventController";
import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";

export async function handleThumbnailEvent(value: {
	videoId: string;
	status: boolean;
	userId: string;
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

		await VideoRepository.updateThumbnailStatus(value.videoId, value.status);

		await handleVideoStatusUpdateEvent({
			videoId: value.videoId,
			status: value.status,
			message: "Thumbnail processed successfully",
			event: "thumbnail-update",
		});

		logger.info("✅ Thumbnail status updated successfully!");
	} catch (error) {
		logger.error(
			`🔴 Error updating thumbnail status for video ${value.videoId}`,
			{ error }
		);
	}
}
