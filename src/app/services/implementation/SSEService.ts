import { Response } from "express";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { logger } from "@/infra/logger";
import { ISSEService, VideoStatusUpdateEvent } from "../ISSEService";

export class SSEService implements ISSEService {
	private userSockets: Map<string, Response> = new Map();
	private eventQueue: { response: Response; data: string }[] = [];

	private generateKey({
		userId,
		workspaceId,
		spaceId,
	}: {
		userId: string;
		workspaceId: string;
		spaceId?: string;
	}) {
		const parts = [userId, workspaceId];
		if (spaceId) parts.push(spaceId);
		return parts.join(":");
	}

	registerConnection({
		response,
		userId,
		workspaceId,
		spaceId,
	}: {
		userId: string;
		workspaceId: string;
		spaceId?: string;
		response: Response;
	}): void {
		response.set({
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		});
		const key = this.generateKey({ userId, workspaceId, spaceId });
		this.userSockets.set(key, response);
		response.on("close", () => {
			this.removeConnection(userId, workspaceId, spaceId);
			logger.info(`🗑️ Removed closed connection for ${key}`);
		});
	}

	removeConnection(
		userId: string,
		workspaceId: string,
		spaceId?: string
	): void {
		const key = this.generateKey({ userId, workspaceId, spaceId });
		this.userSockets.delete(key);
	}

	private processQueue() {
		if (this.eventQueue.length === 0) return;
		const { response, data } = this.eventQueue.shift()!;
		if (!response.writableEnded) {
			response.write(data);
			response.flush();
		}
		setImmediate(() => this.processQueue());
	}

	async sendVideoStatusUpdate(
		videoRepository: IVideoRepository,
		event: VideoStatusUpdateEvent
	): Promise<void> {
		try {
			const video = await videoRepository.getVideoById(event.videoId);
			if (!video) {
				logger.error(`🔴 Video ${event.videoId} not found`);
				throw new Error(`Video ${event.videoId} not found`);
			}

			const key = this.generateKey({
				userId: video.userId,
				workspaceId: video.workspaceId,
				spaceId: video.spaceId,
			});

			const userResponses: Response[] = [];

			if (video.spaceId) {
				this.userSockets.forEach((response, socketKey) => {
					const [userId, workspaceId, socketSpaceId] = socketKey.split(":");
					if (socketSpaceId && socketSpaceId === video.spaceId) {
						const userResponse = this.userSockets.get(socketKey);
						if (userResponse) {
							userResponses.push(userResponse);
						}
					}
				});
			} else {
				const userResponse = this.userSockets.get(key);
				if (userResponse) {
					userResponses.push(userResponse);
				}
			}

			for (const userResponse of userResponses) {
				if (userResponse && !userResponse.writableEnded) {
					const data = `data: ${JSON.stringify({
						...event,
						type: video.type,
						folderId: video.folderId,
						workspaceId: video.workspaceId,
						spaceId: video.spaceId,
					})}\n\n`;
					this.eventQueue.push({ response: userResponse, data });
					this.processQueue();
					logger.info(
						`✅ Sent update to user ${video.userId}: ${event.message}`
					);
				} else {
					logger.warn(`⚠️ User ${video.userId} not connected to SSE`);
				}
			}
		} catch (error) {
			logger.error(
				`🔴 Error sending SSE event for video ${event.videoId}:`,
				error
			);
			throw error;
		}
	}
}
