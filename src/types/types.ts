import { Request } from "express";
import { VideoStatus as VideoStatusField } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
	user: {
		id: string;
	};
}

export interface VideoSuggestion {
	id: string;
	title: string;
	createdAt: string;
	score: number;
	user: { id: string; name: string };
	paginationToken?: string;
}

export interface VideoStatus {
	videoId: string;
	status: VideoStatusField;
	[key: string]: any;
}

export interface AdminDashboardState {
	transcodingVideos: Record<string, VideoStatus>;
	processedVideos: Record<string, VideoStatus>;
	transcriptions: Record<string, VideoStatus>;
	titleSummaries: Record<string, VideoStatus>;
	thumbnails: Record<string, VideoStatus>;
}
