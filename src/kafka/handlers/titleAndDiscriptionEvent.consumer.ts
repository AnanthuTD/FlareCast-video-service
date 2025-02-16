import { handleVideoStatusUpdateEvent } from "../../controllers/eventController";
import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";

export async function handleTitleAndSummary(value: {
	title: string;
	description: string;
	videoId: string;
	status: boolean;
	userId: string; // Ensure userId is included
}) {
	logger.info(
		`⌛ New title and summary event received, status: ${
			value.status ? "🟢 success" : "🔴 failed"
		}`,
		value
	);

	if (!value.status) {
		logger.info(
			"🟡 Skipping title and summary update for video\t" +
			JSON.stringify({ videoId: value.videoId })
		);
		return;
	}

	try {
		logger.info(
			`⌛ Updating title and description for video: ${JSON.stringify(
				value,
				null,
				2
			)}`
		);

		await VideoRepository.updateTitleAndDescription(
			value.videoId,
			value.title,
			value.description
		);

		// Replacing event emitter with direct function call
		await handleVideoStatusUpdateEvent({
			videoId: value.videoId,
			status: value.status,
			message: "Title and description updated successfully",
			event: "title-description",
		});

		logger.info("✅ Title and description updated successfully!");
	} catch (error) {
		logger.error(
			`🔴 Error updating title and description for video ${value.videoId}`,
			{ error }
		);
	}
}
