import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";
import { videoStatusEventEmitter } from "../../event-emitters/videoStatus.emitter";
import { handleVideoStatusUpdateEvent } from "../../controllers/eventController";

export async function handleVideoTranscodeEvent(value: {
	videoId: string;
	status: boolean;
}) {
	logger.info(
		`⌛ New transcode event received, status: ${
			value.status ? "🟢 success" : "🔴 failed"
		}`,
		value
	);

	if (!value.status) {
		logger.info(
			"🟡 Skipping transcode update for video\t" +
				JSON.stringify({ videoId: value.videoId })
		);
		return;
	}

	try {
		await VideoRepository.updateTranscodeStatus(value.videoId, value.status);

		// Emit event for real-time updates
		handleVideoStatusUpdateEvent({
			videoId: value.videoId,
			status: value.status,
			message: "Transcoding completed successfully",
			event: "transcoding",
		});

		logger.info(
			`✅ Transcode status updated successfully for video ${value.videoId}`
		);
	} catch (error) {
		logger.error(
			`🔴 Error updating transcode status for video ${value.videoId}`,
			{ error }
		);
	}
}
