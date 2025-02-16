import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";
import { videoStatusEventEmitter } from "../../event-emitters/videoStatus.emitter";
import { handleVideoStatusUpdateEvent } from "../../controllers/eventController";

export async function handleTranscriptionEvent(value: {
	videoId: string;
	transcription: string;
	status: boolean;
}) {
	logger.info(
		`⌛ New transcription event received, status: ${
			value.status ? "🟢 success" : "🔴 failed"
		}`,
		value
	);

	if (!value.status) {
		logger.info(
			"🟡 Skipping transcription update for video\t" +
				JSON.stringify({ videoId: value.videoId })
		);
		return;
	}

	try {
		const video = await VideoRepository.getVideoById(value.videoId);
		if (!video) {
			logger.error("🔴 Video not found", { videoId: value.videoId });
			return;
		}

		await VideoRepository.updateTranscription(
			value.videoId,
			value.transcription
		);

		await handleVideoStatusUpdateEvent({
			videoId: value.videoId,
			status: true,
			message: "Transcription updated successfully",
			event: "transcription",
		});

		logger.info("✅ Video transcription updated successfully", value);
	} catch (error) {
		logger.error(
			`🔴 Failed to update video transcription for video ${value.videoId}`,
			{ error }
		);
	}
}
