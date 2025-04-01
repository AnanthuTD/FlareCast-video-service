import { VideoUploadEvent } from "@/domain/events/VideoUploadEvent";
import { VideoRemovedEvent } from "@/domain/events/VideoRemovedEvent";
import { VideoSummaryTitleEvent } from "@/domain/events/VideoSummaryTitleEvent";

export interface VideoViewEvent {
	videoId: string;
	userId: string;
	createdAt: Date;
}

export interface IEventService {
	publishVideoUploadEvent(eventData: VideoUploadEvent): Promise<void>;
	publishVideoRemovedEvent(eventData: VideoRemovedEvent): Promise<void>;
	publishVideoSummaryTitleEvent(
		eventData: VideoSummaryTitleEvent
	): Promise<void>;
	sendVideoUploadEvent(data: {
		s3Key: string;
		videoId: string;
		userId?: string;
		aiFeature?: boolean;
	}): Promise<void>;
	sendVideoViewEvent(event: VideoViewEvent): Promise<void>;
	publishSelectedWorkspacePendingEvent(data: {
		userId: string;
		workspaceId?: string;
		folderId?: string;
		spaceId?: string;
	}): Promise<void>;
	publishSelectedWorkspaceValidatedEvent(data: {
		userId: string;
		workspaceId?: string;
		folderId?: string;
		spaceId?: string;
	}): Promise<void>;
	publishSubscriptionValidated(event: {
		userId: any;
		workspaceId: any;
		folderId: any;
		spaceId: any;
		subscriptionLimits: any;
	}): Promise<void>;

	publishVideoCreatedEvent(event: {
		userId: any;
		workspaceId: any;
		folderId: any;
		spaceId: any;
		videoId: string;
		subscriptionLimits: any;
	}): Promise<void>;

	publishVideoFirstViewEvent(data: {
		eventType: string;
		userId: string;
		videoName: string;
		videoId: string;
		viewerName: string;
		viewerId: string;
	}): Promise<void>;
}
