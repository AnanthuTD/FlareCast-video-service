// src/app/services/SSEService.ts
import { Response } from "express";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { logger } from "@/infra/logger";
import { ISSEService, VideoStatusUpdateEvent } from "../ISSEService";


export class SSEService implements ISSEService {
  private userSockets: Map<string, Response> = new Map();

  registerConnection(userId: string, workspaceId: string, response: Response): void {
    const key = `${userId}:${workspaceId}`;
    this.userSockets.set(key, response);
  }

  removeConnection(userId: string, workspaceId: string): void {
    const key = `${userId}:${workspaceId}`;
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

      const key = `${video.userId}:${video.workspaceId}`;
      const userResponse = this.userSockets.get(key);
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
        logger.info(`✅ Sent update to user ${video.userId}: ${event.message}`);
      } else {
        logger.warn(`⚠️ User ${video.userId} not connected to SSE`);
      }
    } catch (error) {
      logger.error(`🔴 Error sending SSE event for video ${event.videoId}:`, error);
    }
  }
}