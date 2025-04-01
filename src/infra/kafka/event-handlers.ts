import { VerifiedUserHandler } from "@/app/handlers/VerifiedUserHandler";
import { TOPICS } from "@/infra/kafka/topics";
import { VideoProcessor } from "../providers/VideoProcessor";
import { SubscriptionRepository } from "../repository/prisma/subscription.repository";
import { VideoRepository } from "../repository/prisma/VideoRepository";
import { S3Service } from "@/app/services/implementation/S3Service";
import { EventService } from "@/app/services/implementation/EventService";
import { KafkaEventPublisher } from "../providers/KafkaEventPublisher";
import { UserRepository } from "../repository/prisma/UserRepository";
import { LocalEventEmitter } from "../providers/LocalEventEmitter";
import { TitleAndDescriptionHandler } from "@/app/handlers/TitleAndDescriptionHandler";
import { SSEService } from "@/app/services/implementation/SSEService";
import { ThumbnailEventHandler } from "@/app/handlers/ThumbnailEventHandler";
import { LiveStreamHandler } from "@/app/handlers/LiveStreamHandler";
import { TranscriptionEventHandler } from "@/app/handlers/TranscriptionEventHandler";
import { VideoProcessedEventHandler } from "@/app/handlers/VideoProcessedEventHandler";
import { VideoTranscodeEventHandler } from "@/app/handlers/VideoTranscodeEventHandler";
import { VideoViewEventHandler } from "@/app/handlers/VideoViewEventHandler";

export function createTopicHandlers(): Record<
	string,
	(topic: string, data: any) => Promise<void>
> {
	const usersRepository = new UserRepository();
	const eventPublisher = new KafkaEventPublisher();
	const eventService = new EventService(eventPublisher);
	const eventEmitter = new LocalEventEmitter();
	const videoRepository = new VideoRepository();
	const sse = new SSEService();

	const titleAndDescriptionHandler = new TitleAndDescriptionHandler(
		videoRepository,
		sse,
		eventEmitter
	);
	const thumbnailHandler = new ThumbnailEventHandler(
		videoRepository,
		sse,
		eventEmitter
	);
	const liveStreamHandler = new LiveStreamHandler(
		videoRepository,
		sse,
		eventEmitter
	);
	const transcriptionHandler = new TranscriptionEventHandler(
		videoRepository,
		sse,
		eventEmitter
	);
	const verifiedUserHandler = new VerifiedUserHandler(usersRepository);
	const videoProcessedHandler = new VideoProcessedEventHandler(
		videoRepository,
		sse,
		eventEmitter
	);
	const videoTranscodeHandler = new VideoTranscodeEventHandler(
		videoRepository,
		sse,
		eventEmitter
	);
	const videoViewHandler = new VideoViewEventHandler(
		videoRepository,
		sse,
		eventEmitter,
		eventService
	);

	const videoProcessor = new VideoProcessor(
		new SubscriptionRepository(),
		new VideoRepository(),
		new S3Service(),
		new EventService(new KafkaEventPublisher())
	);

	return {
		[TOPICS.USER_VERIFIED_EVENT]: (topic: string, data: any) =>
			verifiedUserHandler.handle(topic, data),

		// video pre-processing events
		[TOPICS.VIDEO_PROCESS_REQUEST_EVENT]: (topic: string, data: any) =>
			videoProcessor.validateWorkspace(data),
		[TOPICS.SELECTED_WORKSPACE_VALIDATED]: (topic: string, data: any) =>
			videoProcessor.validateSubscription(data),
		[TOPICS.SUBSCRIPTION_VALIDATED]: (topic: string, data: any) =>
			videoProcessor.createVideo(data),
		[TOPICS.VIDEO_CREATED_EVENT]: (topic: string, data: any) =>
			videoProcessor.uploadToS3(data),

		// video post processing events (transcode service)
		[TOPICS.LIVE_STREAM_EVENT]: (topic: string, data: any) =>
			liveStreamHandler.handle(topic, data),
		[TOPICS.THUMBNAIL_EVENT]: (topic: string, data: any) =>
			thumbnailHandler.handle(topic, data),
		[TOPICS.VIDEO_SUMMARY_TITLE_EVENT]: (topic: string, data: any) =>
			titleAndDescriptionHandler.handle(topic, data),
		[TOPICS.VIDEO_TRANSCRIPTION_EVENT]: (topic: string, data: any) =>
			transcriptionHandler.handle(topic, data),
		[TOPICS.VIDEO_PROCESSED_EVENT]: (topic: string, data: any) =>
			videoProcessedHandler.handle(topic, data),
		[TOPICS.VIDEO_TRANSCODE_EVENT]: (topic: string, data: any) =>
			videoTranscodeHandler.handle(topic, data),
		[TOPICS.FIRST_VIEW]: (topic: string, data: any) =>
			videoViewHandler.handle(topic, data),
	};
}
