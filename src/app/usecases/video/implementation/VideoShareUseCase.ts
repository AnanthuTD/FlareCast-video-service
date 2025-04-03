import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoShareUseCase } from "../IVideoShareUseCase";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IPermissionService } from "@/app/services/implementation/PermissionService";
import { IAwsRepository } from "@/app/repository/IAwsRepository";
import { VideoShareDTO } from "@/domain/dtos/video/VideoShareDTO";
import { VideoShareResponseDTO } from "@/domain/dtos/video/VideoShareResponseDTO";
import { VideoShareErrorType } from "@/domain/enums/video/VideoShareErrorType";
import { logger } from "@/infra/logger";

export class VideoShareUseCase implements IVideoShareUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly permissionService: IPermissionService,
    private readonly awsRepository: IAwsRepository
  ) {}

  async execute(
    dto: VideoShareDTO
  ): Promise<
    ResponseDTO & {
      data: VideoShareResponseDTO | { error: VideoShareErrorType };
    }
  > {
    const { userId, videoId, spaceId, folderId } = dto;

    if (!videoId) {
      return {
        success: false,
        data: { error: VideoShareErrorType.INVALID_INPUT },
      };
    }

    try {
      const video = await this.videoRepository.findById(videoId);
      if (!video) {
        return {
          success: false,
          data: { error: VideoShareErrorType.VIDEO_NOT_FOUND },
        };
      }

      if (video.spaceId === spaceId && video.folderId === folderId) {
        return {
          success: false,
          data: { error: VideoShareErrorType.ALREADY_SHARED },
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
          spaceId,
          folderId,
        },
      });

      if (!permission || permission.permission !== "granted") {
        return {
          success: false,
          data: { error: VideoShareErrorType.UNAUTHORIZED },
        };
      }

      console.log("share permissions: ", permission)

      const newVideo = await this.videoRepository.create({
        ...video.toObject(),
        id: undefined, // Ensure new ID is generated
        spaceId: permission.spaceId ?? undefined, //
        folderId: permission.folderId ?? undefined,
      });

      console.log(newVideo)

      this.awsRepository.copyVideo(videoId, newVideo.id).catch((err) => {
        logger.error(`Failed to copy video ${videoId} to ${newVideo.id} in S3: ${err}`);
      });

      logger.info(`User ${userId} shared video ${videoId} in space ${spaceId} and folder ${folderId}`);

      return {
        success: true,
        data: { message: "Video shared successfully" },
      };
    } catch (error) {
      logger.error(`Failed to share video ${videoId}: ${error instanceof Error ? error.message : error}`);
      return {
        success: false,
        data: { error: VideoShareErrorType.INTERNAL_ERROR },
      };
    }
  }
}