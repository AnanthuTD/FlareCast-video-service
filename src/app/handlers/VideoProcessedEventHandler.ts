import { logger } from "@/infra/logger";
import { IEventHandler } from "../interfaces/IEventHandler";
import { VideoStatus } from "@/domain/entities/Video";
import EventName from "@/domain/enums/eventNames";
import { IVideoRepository } from "../repository/IVideoRepository";
import { ILocalEventEmitter } from "../providers/ILocalEventEmitter";
import { ISSEService } from "../services/ISSEService";
import { sendVideoStatusUpdate } from "@/presentation/http/controllers/sse/eventController";

export class VideoProcessedEventHandler implements IEventHandler {
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
			`Video processed event received, status: ${
				data.status === VideoStatus.SUCCESS ? "🟢 success" : "🔴 failed"
			}`,
			data
		);

		try {
			this.eventEmitter.emit(EventName.VIDEO_PROCESSED, {
				videoId: data.videoId,
				status: data.status,
			});

			if (data.status === VideoStatus.SUCCESS) {
				await this.videoRepository.updateProcessingStatus(data.videoId, false);
				logger.info(
					`✅ Video processed successfully for video ${data.videoId}`
				);
				sendVideoStatusUpdate({
					videoId: data.videoId,
					status: data.status,
					message: "Video Processed successfully",
					event: "processed",
				});
			}
		} catch (error) {
			logger.error(`🔴 Error processing video ${data.videoId}`, { error });
		}
	}
}
