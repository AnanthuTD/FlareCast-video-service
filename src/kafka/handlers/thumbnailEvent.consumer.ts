import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";

export async function handleThumbnailEvent(value: {
	videoId: string;
	status: boolean;
}) {
  logger.info(
		`⌛ New thumbnail event received, status: ${
			value.status ? "🟢 success" : "🔴 failed"
		}`,
		value
	);

	if (!value.status) {
		logger.info(
			"🟡 Skipping thumbnail update for video",
			+JSON.stringify({ videoId: value.videoId })
		);
		return;
	}

	try {
		logger.info(
			"⌛ Updating title and description for video: " +
				JSON.stringify(value, null, 2)
		);
		await VideoRepository.updateThumbnailStatus(value.videoId, value.status);
		logger.info("✅ Title and description updated successfully!");
	} catch (error) {
		logger.error("🔴 Error updating title and description!", error);
	}
}
