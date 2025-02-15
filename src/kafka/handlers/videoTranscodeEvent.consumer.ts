import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";

export function handleVideoTranscodeEvent(value: {
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
			"Skipping transcription update for video",
			+JSON.stringify({ videoId: value.videoId })
		);
		return;
	}

	if (value.videoId && value.status) {
    VideoRepository.updateTranscodeStatus(value.videoId, value.status);
	}
}
