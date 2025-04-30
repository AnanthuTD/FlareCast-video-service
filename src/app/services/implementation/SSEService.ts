import { Response } from "express";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { logger } from "@/infra/logger";
import { ISSEService, VideoStatusUpdateEvent } from "../ISSEService";

export class SSEService implements ISSEService {
	private userSockets: Map<string, Response> = new Map();

	private generateKey({
		userId,
		workspaceId,
		spaceId,
	}: {
		userId: string;
		workspaceId: string;
		spaceId?: string;
	}) {
		return `${userId}:${workspaceId}${spaceId ? ":" + spaceId : ""}`;
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
		const key = this.generateKey({ userId, workspaceId, spaceId });
		this.userSockets.set(key, response);
	}

	removeConnection(
		userId: string,
		workspaceId: string,
		spaceId?: string
	): void {
		const key = this.generateKey({ userId, workspaceId, spaceId });
		this.userSockets.delete(key);
	}

	async sendVideoStatusUpdate(
		videoRepository: IVideoRepository,
		event: VideoStatusUpdateEvent
	): Promise<void> {
		try {
			const video = await videoRepository.getVideoById(event.videoId);
			if (!video) {
				logger.error(`🔴 Video ${event.videoId} not found`);
				return;
			}

			const key = this.generateKey({
				userId: video.userId,
				workspaceId: video.workspaceId,
				spaceId: video.spaceId,
			});

			const userResponses: Response[] = [];

			if (video.spaceId) {
				for (const key in this.userSockets) {
					logger.debug("key = " + key);

					const keyArray = key.split(":");

					console.log("keyArray = ", keyArray);

					if (keyArray.length >= 3 && keyArray[2] === video.spaceId) {
						console.log("Matched = ", key);
						userResponses.push(this.userSockets.get(key)!);
					}
				}
			} else {
				// personal lib
				userResponses.push(this.userSockets.get(key)!);
			}

			for (const userResponse of userResponses) {
				if (userResponse) {
					userResponse.write(
						`data: ${JSON.stringify({
							...event,
							type: video.type,
							folderId: video.folderId,
							workspaceId: video.workspaceId,
							spaceId: video.spaceId,
						})}\n\n`
					);
					userResponse.flush();
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
		}
	}
}
