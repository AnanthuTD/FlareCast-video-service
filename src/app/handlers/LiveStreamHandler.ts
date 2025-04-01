import { IVideoRepository } from "../repository/IVideoRepository";
import { ISSEService } from "../services/ISSEService";
import { ILocalEventEmitter } from "../providers/ILocalEventEmitter";
import { IEventHandler } from "../interfaces/IEventHandler";
import { logger } from "@/infra/logger";
import EventName from "@/domain/enums/eventNames";
import { VideoStatus } from "@/domain/entities/Video";
import { sendVideoStatusUpdate } from "@/presentation/http/controllers/sse/eventController";

export class LiveStreamHandler implements IEventHandler {
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
			`Live stream event received, status: ${
				data ? "🟢 success" : "🔴 failed"
			}`,
			data
		);

		if (data.status) {
			this.eventEmitter.emit(EventName.LIVE_STREAMING, {
				videoId: data.videoId,
				status: data.status,
			});

			await this.videoRepository.setLiveStreamStatus(data.videoId, data.status);

			sendVideoStatusUpdate({
				videoId: data.videoId,
				status: data.status,
				message: "Started live stream",
				event: "liveStream",
			});
		}
	}
}
