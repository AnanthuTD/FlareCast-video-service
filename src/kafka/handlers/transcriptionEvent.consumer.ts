import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";
import { handleVideoStatusUpdateEvent } from "../../controllers/eventController";
import { VideoStatus } from "@prisma/client";
import eventEmitter from "../../eventEmitter";
import EventName from "../../eventEmitter/eventNames";

export async function handleTranscriptionEvent(value: {
	videoId: string;
	transcription: string;
	status: VideoStatus;
}) {
	logger.info(
		`⌛ New transcription event received, status: ${
			value.status === VideoStatus.SUCCESS
				? "🟢 success"
				: value.status === VideoStatus.FAILED
				? "🔴 failed"
				: "🟡 processing"
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
		eventEmitter.emit(EventName.TRANSCRIPTION, {
			videoId: value.videoId,
			status: value.status,
			transcription:
				value.status === VideoStatus.SUCCESS ? value.transcription : undefined,
		});

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
			status: value.status,
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
