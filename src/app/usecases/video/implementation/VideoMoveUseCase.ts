import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IVideoMoveUseCase } from "../IVideoMoveUseCase";
import { VideoMoveDTO } from "@/domain/dtos/video/VideoMoveDTO";
import { VideoMoveResponseDTO } from "@/domain/dtos/video/VideoMoveResponseDTO";
import { VideoMoveErrorType } from "@/domain/enums/video/VideoMoveErrorType";
import { logger } from "@/infra/logger";
import { IPermissionService } from "@/app/services/implementation/PermissionService";

export class VideoMoveUseCase implements IVideoMoveUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly permissionService: IPermissionService
  ) {}

  async execute(
    dto: VideoMoveDTO
  ): Promise<
    ResponseDTO & {
      data: VideoMoveResponseDTO | { error: VideoMoveErrorType };
    }
  > {
    const { userId, videoId, folderId } = dto;

    if (!videoId) {
      return {
        success: false,
        data: { error: VideoMoveErrorType.INVALID_INPUT },
      };
    }

    try {
      const video = await this.videoRepository.findById(videoId);
      if (!video) {
        return {
          success: false,
          data: { error: VideoMoveErrorType.VIDEO_NOT_FOUND },
        };
      }

      if (video.folderId === folderId) {
        return {
          success: false,
          data: { error: VideoMoveErrorType.ALREADY_MOVED },
        };
      }

      const permission = await this.permissionService.checkPermission({
        userId,
        source: {
          workspaceId: video.workspaceId,
          spaceId: video.spaceId,
          folderId: video.folderId,
        },
        destination: {
          workspaceId: video.workspaceId,
          folderId,
        },
      });

      if (!permission || permission.permission !== "granted") {
        return {
          success: false,
          data: { error: VideoMoveErrorType.UNAUTHORIZED },
        };
      }

      await this.videoRepository.update(videoId, { folderId });

      logger.info(`User ${userId} moved video ${videoId} to folder ${folderId}`);

      return {
        success: true,
        data: { message: "Video shared successfully" },
      };
    } catch (error) {
      logger.error(`Failed to move video ${videoId}: ${error instanceof Error ? error.message : error}`);
      return {
        success: false,
        data: { error: VideoMoveErrorType.INTERNAL_ERROR },
      };
    }
  }
}