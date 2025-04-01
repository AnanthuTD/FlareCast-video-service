import { IVideoRepository } from "../repository/IVideoRepository";
import { ISSEService } from "../services/ISSEService";
import { ILocalEventEmitter } from "../providers/ILocalEventEmitter";
import { IEventHandler } from "../interfaces/IEventHandler";
import { logger } from "@/infra/logger";
import EventName from "@/domain/enums/eventNames";
import { VideoStatus } from "@/domain/entities/Video";
import { sendVideoStatusUpdate } from "@/presentation/http/controllers/sse/eventController";

export class TranscriptionEventHandler implements IEventHandler {
	constructor(
		private readonly videoRepository: IVideoRepository,
		private readonly sse: ISSEService,
		private readonly eventEmitter: ILocalEventEmitter
	) {}

	async handle(
		topic: string,
		data: {
			videoId: string;
			transcription: string;
			status: VideoStatus;
		} & { status: VideoStatus }
	): Promise<void> {
		logger.info(
			`⌛ New transcription event received, status: ${
				data.status === VideoStatus.SUCCESS
					? "🟢 success"
					: data.status === VideoStatus.FAILED
					? "🔴 failed"
					: "🟡 processing"
			}`,
			data
		);

		try {
			const video = await this.videoRepository.findById(data.videoId);
			if (!video) {
				logger.error("🔴 Video not found", { videoId: data.videoId });
				return;
			}

			if (video.transcriptionStatus === VideoStatus.SUCCESS) {
				logger.info(
					"🟡 Skipping transcription update for video\t" + JSON.stringify(data)
				);
				return;
			}

			this.eventEmitter.emit(EventName.TRANSCRIPTION, {
				videoId: data.videoId,
				status: data.status,
				transcription:
					data.status === VideoStatus.SUCCESS ? data.transcription : undefined,
			});

			await this.videoRepository.updateTranscription(
				data.videoId,
				data.transcription
			);

			sendVideoStatusUpdate({
				videoId: data.videoId,
				status: data.status,
				message: "Transcription updated successfully",
				event: "transcription",
			});
			/* await this.sse.sendVideoStatusUpdate(this.videoRepository, {
				videoId: data.videoId,
				status: data.status,
				message: "Transcription updated successfully",
				event: "transcription",
			}); */

			logger.info("✅ Video transcription updated successfully", data);
		} catch (error) {
			logger.error(
				`🔴 Failed to update video transcription for video ${data.videoId}`,
				{ error }
			);
		}
	}
}
