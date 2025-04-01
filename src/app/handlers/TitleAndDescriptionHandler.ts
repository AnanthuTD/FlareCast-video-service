import { logger } from "@/infra/logger";
import { VideoSummaryTitleEvent } from "@/domain/events/VideoSummaryTitleEvent";
import { IEventHandler } from "../interfaces/IEventHandler";
import { IVideoRepository } from "../repository/IVideoRepository";
import { ISSEService } from "../services/ISSEService";
import { VideoStatus } from "@/domain/entities/Video";
import { ILocalEventEmitter } from "../providers/ILocalEventEmitter";
import EventName from "@/domain/enums/eventNames";
import { sendVideoStatusUpdate } from "@/presentation/http/controllers/sse/eventController";

export class TitleAndDescriptionHandler implements IEventHandler {
	constructor(
		private readonly videoRepository: IVideoRepository,
		private readonly sse: ISSEService,
		private readonly eventEmitter: ILocalEventEmitter
	) {}

	async handle(
		topic: string,
		data: VideoSummaryTitleEvent & { status: VideoStatus }
	): Promise<void> {
		logger.info(
			`⌛ New title and summary event received, status: ${
				data.status === VideoStatus.SUCCESS
					? "🟢 success"
					: data.status === VideoStatus.FAILED
					? "🔴 failed"
					: "🟡 processing"
			}`,
			data
		);

		try {
			logger.info(
				`⌛ Updating title and description for video: ${JSON.stringify(
					data,
					null,
					2
				)}`
			);

			const video = await this.videoRepository.findById(data.videoId);
			if (!video) {
				logger.error("🔴 Video not found", { videoId: data.videoId });
				return;
			}

			if (video.titleStatus === VideoStatus.SUCCESS) {
				logger.info(
					"🟡 Skipping title & description update for video\t" +
						JSON.stringify(data)
				);
				return;
			}

			await this.videoRepository.updateTitleAndDescription(
				data.videoId,
				data.title,
				data.description,
				data.status
			);

			// Replacing event emitter with direct function call
			sendVideoStatusUpdate({
				videoId: data.videoId,
				status: data.status,
				message: "Title and description updated successfully",
				event: "title-description",
			});
			/* await this.sse.sendVideoStatusUpdate(this.videoRepository, {
				videoId: data.videoId,
				status: data.status,
				message: "Title and description updated successfully",
				event: "title-description",
			}); */

			this.eventEmitter.emit(EventName.TITLE_SUMMARY, {
				videoId: data.videoId,
				status: data.status,
				title: data.status === VideoStatus.SUCCESS ? data.title : undefined,
				description:
					data.status === VideoStatus.SUCCESS ? data.description : undefined,
				userId: data.userId,
			});

			logger.info("✅ Title and description updated successfully!");
		} catch (error) {
			logger.error(
				`🔴 Error updating title and description for video ${data.videoId}`,
				{ error }
			);
		}
	}
}
