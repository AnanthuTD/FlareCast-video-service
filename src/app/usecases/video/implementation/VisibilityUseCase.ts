import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IVisibilityUseCase } from "../IVisibilityUseCase";
import { VisibilityDTO } from "@/domain/dtos/video/VisibilityDTO";
import { VisibilityResponseDTO } from "@/domain/dtos/video/VisibilityResponseDTO";
import { VisibilityErrorType } from "@/domain/enums/video/VisibilityErrorType";
import { logger } from "@/infra/logger";

export class VisibilityUseCase implements IVisibilityUseCase {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(
    dto: VisibilityDTO
  ): Promise<
    ResponseDTO & {
      data: VisibilityResponseDTO | { error: VisibilityErrorType };
    }
  > {
    const { userId, videoId, isPublic } = dto;

    if (!videoId || isPublic === undefined) {
      return {
        success: false,
        data: { error: VisibilityErrorType.INVALID_INPUT },
      };
    }

    try {
      const video = await this.videoRepository.findByIdAndUserId(videoId, userId);
      if (!video) {
        return {
          success: false,
          data: { error: VisibilityErrorType.VIDEO_NOT_FOUND },
        };
      }

      const updatedVideo = await this.videoRepository.updateVisibility(videoId, isPublic);

      return {
        success: true,
        data: {
          isPublic: updatedVideo.isPublic,
          message: `Visibility updated to ${updatedVideo.isPublic}`,
        },
      };
    } catch (error) {
      logger.error(`Failed to update visibility for video ${videoId}: ${error instanceof Error ? error.message : error}`);
      return {
        success: false,
        data: { error: VisibilityErrorType.INTERNAL_ERROR },
      };
    }
  }
}