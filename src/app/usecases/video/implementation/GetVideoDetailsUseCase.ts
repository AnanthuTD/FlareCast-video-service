import { ResponseDTO } from "@/domain/dtos/Response";
import { IGetVideoDetailsUseCase } from "../IGetVideoDetailsUseCase";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IWatchLaterRepository } from "@/app/repository/IWatchLaterRepository";
import { ICollaborationService } from "@/app/services/ICollaborationService";
import { GetVideoDetailsDTO } from "@/domain/dtos/video/GetVideoDetailsDTO";
import { GetVideoDetailsResponseDTO } from "@/domain/dtos/video/GetVideoDetailsResponseDTO";
import { GetVideoDetailsErrorType } from "@/domain/enums/video/GetVideoDetailsErrorType";
import { logger } from "@/infra/logger";

export class GetVideoDetailsUseCase implements IGetVideoDetailsUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly watchLaterRepository: IWatchLaterRepository,
    private readonly collaborationService: ICollaborationService
  ) {}

  async execute(
    dto: GetVideoDetailsDTO
  ): Promise<
    ResponseDTO & {
      data: GetVideoDetailsResponseDTO | { error: GetVideoDetailsErrorType };
    }
  > {
    const { userId, videoId } = dto;

    try {
      const video = await this.videoRepository.findById(videoId);
      if (!video) {
        return {
          success: false,
          data: { error: GetVideoDetailsErrorType.VIDEO_NOT_FOUND },
        };
      }

      // Check permissions
      if (!video.isPublic && video.userId !== userId) {
        if (!video.spaceId) {
          logger.debug("Video is not public and user is not the owner");
          return {
            success: false,
            data: { error: GetVideoDetailsErrorType.UNAUTHORIZED },
          };
        }

        const isMember = await this.collaborationService.isSpaceMember(
          video.spaceId,
          userId
        );
        if (!isMember) {
          logger.debug("User is not a member of the space and has no permission");
          return {
            success: false,
            data: { error: GetVideoDetailsErrorType.UNAUTHORIZED },
          };
        }
        if (isMember === null) {
          return {
            success: false,
            data: { error: GetVideoDetailsErrorType.PERMISSION_CHECK_FAILED },
          };
        }
      }

      const watchLater = await this.watchLaterRepository.findByUserAndVideo(
        userId,
        videoId,
        video.workspaceId
      );

      return {
        success: true,
        data: {
          video: {
            ...video.toObject(),
            watchLater: watchLater ? { id: watchLater.id } : null,
          },
        },
      };
    } catch (error) {
      logger.error("Error fetching video details:", error);
      return {
        success: false,
        data: { error: GetVideoDetailsErrorType.INTERNAL_ERROR },
      };
    }
  }
}