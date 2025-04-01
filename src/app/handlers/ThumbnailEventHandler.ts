import { IVideoRepository } from "../repository/IVideoRepository";
import { ISSEService } from "../services/ISSEService";
import { ILocalEventEmitter } from "../providers/ILocalEventEmitter";
import { IEventHandler } from "../interfaces/IEventHandler";
import { logger } from "@/infra/logger";
import EventName from "@/domain/enums/eventNames";
import { VideoStatus } from "@/domain/entities/Video";
import { sendVideoStatusUpdate } from "@/presentation/http/controllers/sse/eventController";

export class ThumbnailEventHandler implements IEventHandler {
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
			duration: string;
		} & { status: VideoStatus }
	): Promise<void> {
		logger.info(
			`⌛ New thumbnail event received, status: ${
				data.status ? "🟢 success" : "🔴 failed"
			}`,
			data
		);

		try {
			logger.info(
				`⌛ Updating thumbnail status for video: ${JSON.stringify(
					data,
					null,
					2
				)}`
			);

			this.eventEmitter.emit(EventName.THUMBNAIL, {
				videoId: data.videoId,
				status: data.status,
				duration:
					data.status !== VideoStatus.SUCCESS ? data.duration : undefined,
			});

			const video = await this.videoRepository.findById(data.videoId);
			if (!video) {
				logger.error("�� Video not found", { videoId: data.videoId });
				return;
			}

			if (video.thumbnailStatus === VideoStatus.SUCCESS) {
				logger.info(
					"🟡 Skipping thumbnail update for video\t" + JSON.stringify(data)
				);
				return;
			}

			await this.videoRepository.setThumbnailStatus(data.videoId, data.status);

			sendVideoStatusUpdate({
				videoId: data.videoId,
				status: data.status,
				message: "Thumbnail processed successfully",
				event: "thumbnail-update",
			});
			/* 	await this.sse.sendVideoStatusUpdate(this.videoRepository, {
				videoId: data.videoId,
				status: data.status,
				message: "Thumbnail processed successfully",
				event: "thumbnail-update",
			}); */

			const updatedVideo = await this.videoRepository.setDuration(
				data.videoId,
				data.duration
			);

			console.log("updatedVideo: ", updatedVideo);

			logger.info("✅ Thumbnail status updated successfully!");
		} catch (error) {
			logger.error(
				`🔴 Error updating thumbnail status for video ${data.videoId}`,
				{ error }
			);
		}
	}
}
