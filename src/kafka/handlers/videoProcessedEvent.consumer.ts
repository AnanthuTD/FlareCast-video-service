import { VideoStatus } from "@prisma/client";
import eventEmitter from "../../eventEmitter";
import EventName from "../../eventEmitter/eventNames";
import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";

export async function handleVideoProcessedEvent(value: {
	videoId: string;
	status: VideoStatus;
}) {
	logger.info(
		`Video processed event received, status: ${
			value.status === VideoStatus.SUCCESS ? "🟢 success" : "🔴 failed"
		}`,
		value
	);

	try {
		eventEmitter.emit(EventName.VIDEO_PROCESSED, {
			videoId: value.videoId,
			status: value.status,
		});

		if (value.status === VideoStatus.SUCCESS) {
			await VideoRepository.updateProcessingStatus(value.videoId, false);
			logger.info(`✅ Video processed successfully for video ${value.videoId}`);
		}
	} catch (error) {
		logger.error(`🔴 Error processing video ${value.videoId}`, { error });
	}
}
