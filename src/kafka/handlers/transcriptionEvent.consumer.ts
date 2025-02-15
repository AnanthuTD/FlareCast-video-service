import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";

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
			"Skipping transcription update for video",
			+JSON.stringify({ videoId: value.videoId })
		);
		return;
	}

	try {
		if (!(await VideoRepository.getVideoById(value.videoId))) {
			logger.error("Video not found", { videoId: value.videoId });
			return;
		}

		await VideoRepository.updateTranscription(
			value.videoId,
			value.transcription
		);
	} catch (error) {
		logger.error("Failed to update video transcription", { error });
	}

	logger.info("Video transcription updated", value);
}
