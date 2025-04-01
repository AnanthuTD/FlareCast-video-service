import { IVideoRepository } from "../repository/IVideoRepository";
import { type Response } from "express";

export interface VideoStatusUpdateEvent {
	videoId: string;
	status: string;
	message: string;
	event: string;
}

export interface ISSEService {
	registerConnection(
		userId: string,
		workspaceId: string,
		response: Response
	): void;
	removeConnection(userId: string, workspaceId: string): void;
	sendVideoStatusUpdate(
		videoRepository: IVideoRepository,
		event: VideoStatusUpdateEvent
	): Promise<void>;
}
