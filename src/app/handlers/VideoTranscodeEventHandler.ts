import { logger } from "@/infra/logger";
import { IEventHandler } from "../interfaces/IEventHandler";
import { VideoStatus } from "@/domain/entities/Video";
import EventName from "@/domain/enums/eventNames";
import { IVideoRepository } from "../repository/IVideoRepository";
import { ILocalEventEmitter } from "../providers/ILocalEventEmitter";
import { ISSEService } from "../services/ISSEService";
import { sendVideoStatusUpdate } from "@/presentation/http/controllers/sse/eventController";

export class VideoTranscodeEventHandler implements IEventHandler {
	constructor(
		private readonly videoRepository: IVideoRepository,
		private readonly sse: ISSEService,
		private readonly eventEmitter: ILocalEventEmitter
	) {}

	async handle(
		topic: string,
		data: {
			videoId: string;
			status: VideoStatus;
		}
	): Promise<void> {
		logger.info(
			`⌛ New transcode event received, status: ${
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

			if (video.transcodeStatus === VideoStatus.SUCCESS) {
				logger.info(
					"🟡 Skipping transcode update for video\t" + JSON.stringify(data)
				);
				return;
			}

			this.eventEmitter.emit(EventName.VIDEO_TRANSCODE, {
				videoId: data.videoId,
				status: data.status,
			});

			if (data.status === VideoStatus.FAILED) {
				logger.info(
					"🟡 Skipping transcode update for video\t" +
						JSON.stringify({ videoId: data.videoId })
				);
				return;
			}

			await this.videoRepository.setTranscodeStatus(data.videoId, data.status);

			// Emit event for real-time updates
			sendVideoStatusUpdate({
				videoId: data.videoId,
				status: data.status,
				message: "Transcoding completed successfully",
				event: "transcoding",
			});

			logger.info(
				`✅ Transcode status updated successfully for video ${data.videoId}`
			);
		} catch (error) {
			logger.error(
				`🔴 Error updating transcode status for video ${data.videoId}`,
				{ error }
			);
		}
	}
}
