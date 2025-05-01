import { VideoEntity, VideoStatus } from "@/domain/entities/Video";
import { Video, VideoCategory } from "@prisma/client";

export interface VideoSuggestion {
	id: string;
	title: string;
	createdAt: string;
	score: number;
	user: { id: string; name: string };
	paginationToken?: string;
}

export interface AdminDashboardVideoStatus {
	videoId: string;
	status: VideoStatus;
}

export interface AdminDashboardState {
	transcodingVideos: Record<string, AdminDashboardVideoStatus>;
	processedVideos: Record<string, AdminDashboardVideoStatus>;
	transcriptions: Record<string, AdminDashboardVideoStatus>;
	titleSummaries: Record<string, AdminDashboardVideoStatus>;
	thumbnails: Record<string, AdminDashboardVideoStatus>;
}

export interface SearchVideoData {
	title: boolean;
	description: boolean;
	paginationToken: string;
	score: number;
}

export interface IVideoRepository {
	create(data: Partial<Video>): Promise<VideoEntity>;

	updateProcessingStatus(
		videoId: string,
		status: boolean
	): Promise<VideoEntity>;

	updateTitleAndDescription(
		videoId: string,
		title: string,
		description: string,
		status: VideoStatus
	): Promise<VideoEntity>;

	updateTranscription(
		videoId: string,
		transcription: string
	): Promise<VideoEntity>;

	findById(videoId: string): Promise<VideoEntity | null>;

	setTranscodeStatus(
		videoId: string,
		status: VideoStatus
	): Promise<VideoEntity>;

	setThumbnailStatus(
		videoId: string,
		status: VideoStatus
	): Promise<VideoEntity>;

	setLiveStreamStatus(
		videoId: string,
		status: VideoStatus
	): Promise<VideoEntity>;

	findWorkspaceIdByVideoId(videoId: string): Promise<string | null>;

	delete(videoId: string): Promise<void>;

	updateTitle(videoId: string, title: string): Promise<VideoEntity>;

	updateDescription(videoId: string, description: string): Promise<VideoEntity>;

	searchVideo(params: {
		query: string;
		limit: number;
		direction: "searchAfter" | "searchBefore";
		paginationToken?: string;
		workspaceId?: string;
	}): Promise<any[]>;

	suggestVideos(params: {
		query: string;
		limit: number;
		workspaceId?: string;
		direction: "searchAfter" | "searchBefore";
		paginationToken?: string;
	}): Promise<VideoSuggestion[]>;

	fetchAdminDashboardState(): Promise<AdminDashboardState>;

	updateVisibility(id: string, visibility: boolean): Promise<VideoEntity>;

	setPromotionalVideo(videoId: string): Promise<VideoEntity>;

	getVideoById(videoId: string): Promise<VideoEntity | null>;

	findPromotionalVideos(
		skip: number,
		limit: number,
		category: VideoCategory,
		isPublic?: boolean
	): Promise<VideoEntity[]>;
	countPromotionalVideos({
		category,
		isPublic,
	}: {
		category: string;
		isPublic?: boolean;
	}): Promise<number>;

	findVideos(query: any, skip: number, limit: number): Promise<VideoEntity[]>;
	countVideos(query: any): Promise<number>;

	createLiveStream(params: {
		userId: string;
		workspaceId: string;
		folderId?: string;
		spaceId?: string;
	}): Promise<VideoEntity>;

	update(videoId: string, data: Partial<VideoEntity>): Promise<void>;

	findByIdAndUserId(
		videoId: string,
		userId: string
	): Promise<VideoEntity | null>;
	updateVisibility(videoId: string, isPublic: boolean): Promise<VideoEntity>;
	findManyByIds(
		videoIds: string[],
		skip: number,
		take: number
	): Promise<VideoEntity[]>;

	setDuration(videoId: string, duration: string): Promise<any>;
}
