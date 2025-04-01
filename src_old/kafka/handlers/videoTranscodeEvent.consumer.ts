import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";
import { videoStatusEventEmitter } from "../../event-emitters/videoStatus.emitter";
import { handleVideoStatusUpdateEvent } from "../../controllers/eventController";
import { VideoStatus } from "@prisma/client";
import EventName from "../../eventEmitter/eventNames";
import eventEmitter from "../../eventEmitter";

export async function handleVideoTranscodeEvent(value: {
	videoId: string;
	status: VideoStatus;
}) {
	logger.info(
		`⌛ New transcode event received, status: ${
			value.status === VideoStatus.SUCCESS
				? "🟢 success"
				: value.status === VideoStatus.FAILED
				? "🔴 failed"
				: "🟡 processing"
		}`,
		value
	);

	try {
		eventEmitter.emit(EventName.VIDEO_TRANSCODE, {
			videoId: value.videoId,
			status: value.status,
		});

		if (value.status === VideoStatus.FAILED) {
			logger.info(
				"🟡 Skipping transcode update for video\t" +
					JSON.stringify({ videoId: value.videoId })
			);
			return;
		}

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
