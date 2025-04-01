import { IEventPublisher } from "@/app/interfaces/IEventPublisher";
import { VideoUploadEvent } from "@/domain/events/VideoUploadEvent";
import { VideoRemovedEvent } from "@/domain/events/VideoRemovedEvent";
import { VideoSummaryTitleEvent } from "@/domain/events/VideoSummaryTitleEvent";
import { TOPICS } from "@/infra/kafka/topics";
import { logger } from "@/infra/logger";
import { IEventService, VideoViewEvent } from "../IEventService";

export class EventService implements IEventService {
	constructor(private readonly eventPublisher: IEventPublisher) {}

	async publishVideoUploadEvent(eventData: VideoUploadEvent): Promise<void> {
		try {
			await this.eventPublisher.publish(TOPICS.VIDEO_UPLOAD_EVENT, eventData);
			logger.debug(
				`✔️ Published video.uploaded event: ${JSON.stringify(
					eventData,
					null,
					2
				)}`
			);
		} catch (error: any) {
			logger.error(
				`Failed to publish video.uploaded event: ${JSON.stringify(eventData)}`,
				error
			);
			throw new Error(
				`Failed to publish video.uploaded event: ${error.message}`
			);
		}
	}

	async publishVideoRemovedEvent(eventData: VideoRemovedEvent): Promise<void> {
		try {
			await this.eventPublisher.publish(TOPICS.VIDEO_REMOVED_EVENT, eventData);
			logger.debug(
				`✔️ Published video.removed event: ${JSON.stringify(
					eventData,
					null,
					2
				)}`
			);
		} catch (error: any) {
			logger.error(
				`Failed to publish video.removed event: ${JSON.stringify(eventData)}`,
				error
			);
			throw new Error(
				`Failed to publish video.removed event: ${error.message}`
			);
		}
	}

	async publishVideoSummaryTitleEvent(
		eventData: VideoSummaryTitleEvent
	): Promise<void> {
		try {
			await this.eventPublisher.publish(
				TOPICS.VIDEO_SUMMARY_TITLE_EVENT,
				eventData
			);
			logger.debug(
				`✔️ Published video.summary-title event: ${JSON.stringify(
					eventData,
					null,
					2
				)}`
			);
		} catch (error: any) {
			logger.error(
				`Failed to publish video.summary-title event: ${JSON.stringify(
					eventData
				)}`,
				error
			);
			throw new Error(
				`Failed to publish video.summary-title event: ${error.message}`
			);
		}
	}

	async sendVideoUploadEvent(data: {
		s3Key: string;
		videoId: string;
		userId?: string;
		aiFeature?: boolean;
	}): Promise<void> {
		try {
			logger.info("Preparing to send video upload event");

			/*  const eventData: VideoUploadEvent = {
        videoId: data.videoId,
        userId: data.userId ?? "",
        title: "", // Placeholder; title might be set later
        url: data.s3Key,
        createdAt: new Date().toISOString(),
      }; */

			// await this.publishVideoUploadEvent(eventData);
			await this.eventPublisher.publish(TOPICS.VIDEO_UPLOAD_EVENT, data);
			logger.info("✅ Video upload event sent successfully");
		} catch (error: any) {
			logger.error("Failed to send video upload event:", error);
			throw error;
		}
	}

	async sendVideoViewEvent(event: VideoViewEvent): Promise<void> {
		await this.eventPublisher.publish(
			TOPICS.VIDEO_VIEW_EVENT,
			event
		);
	}

	async publishSelectedWorkspacePendingEvent(event: any): Promise<void> {
		await this.eventPublisher.publish(
			TOPICS.SELECTED_WORKSPACE_PENDING,
			event
		);
	}

	async publishSelectedWorkspaceValidatedEvent(event: {
		userId: any;
		workspaceId: any;
		folderId: any;
		spaceId: any;
	}): Promise<void> {
		await this.eventPublisher.publish(
			TOPICS.SELECTED_WORKSPACE_VALIDATED,
			event
		);
	}

	async publishSubscriptionValidated(event: {
		userId: any;
		workspaceId: any;
		folderId: any;
		spaceId: any;
		subscriptionLimits: any;
	}): Promise<void> {
		await this.eventPublisher.publish(
			TOPICS.SUBSCRIPTION_VALIDATED,
			event
		);
	}

	async publishVideoCreatedEvent(event: {
		userId: any;
		workspaceId: any;
		folderId: any;
		spaceId: any;
		videoId: string;
		subscriptionLimits: any;
	}): Promise<void> {
		await this.eventPublisher.publish(
			TOPICS.VIDEO_CREATED_EVENT,
			event
		);
	}

	async publishVideoProcessRequestEvent(event: {
		userId: any;
		workspaceId: any;
		folderId: any;
		spaceId: any;
	}): Promise<void> {
		await this.eventPublisher.publish(
			TOPICS.VIDEO_PROCESS_REQUEST_EVENT,
			event
		);
	}

	async sendVideoRemovedEvent(data: { videoId: string; userId: string }) {
		logger.info(
			"Sending video removed event to kafka topic: " +
				TOPICS.VIDEO_REMOVED_EVENT
		);
		const message = data
		await this.eventPublisher.publish(TOPICS.VIDEO_REMOVED_EVENT, message);
	}

	async publishVideoFirstViewEvent(data: {
		eventType: string;
		userId: string;
		videoName: string;
		videoId: string;
		viewerName: string;
		viewerId: string;
	}) {
		logger.info(
			"Sending video first view event: " +
			TOPICS.FIRST_VIEW
		);
		await this.eventPublisher.publish(TOPICS.FIRST_VIEW, data);
	}
}
