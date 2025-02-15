import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";

export async function handleVideoProcessedEvent(value: {
	videoId: string;
	status: boolean;
}) {
	logger.info(
		`Video processed event received, status: ${
			value ? "🟢 success" : "🔴 failed"
		}`,
		value
	);

	if (value.status) {
		await VideoRepository.updateProcessingStatus(value.videoId, false);
	}
}
