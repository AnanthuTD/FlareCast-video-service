import { ResponseDTO } from "@/domain/dtos/Response";
import { IUpdateVideoTitleUseCase } from "../IUpdateVideoTitleUseCase";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { UpdateVideoTitleDTO } from "@/domain/dtos/video/UpdateVideoTitleDTO";
import { UpdateVideoTitleResponseDTO } from "@/domain/dtos/video/UpdateVideoTitleResponseDTO";
import { UpdateVideoTitleErrorType } from "@/domain/enums/video/UpdateVideoTitleErrorType";
import { logger } from "@/infra/logger";

export class UpdateVideoTitleUseCase implements IUpdateVideoTitleUseCase {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(
    dto: UpdateVideoTitleDTO
  ): Promise<
    ResponseDTO & {
      data: UpdateVideoTitleResponseDTO | { error: UpdateVideoTitleErrorType };
    }
  > {
    const { userId, videoId, title } = dto;

    if (!videoId || !title) {
      return {
        success: false,
        data: { error: UpdateVideoTitleErrorType.INVALID_INPUT },
      };
    }

    try {
      // Check if video exists and user has permission
      const video = await this.videoRepository.findById(videoId);
      if (!video) {
        return {
          success: false,
          data: { error: UpdateVideoTitleErrorType.VIDEO_NOT_FOUND },
        };
      }

      if (video.userId !== userId) {
        // TODO: Add more sophisticated permission logic if needed (e.g., workspace roles)
        return {
          success: false,
          data: { error: UpdateVideoTitleErrorType.UNAUTHORIZED },
        };
      }

      const updated = await this.videoRepository.updateTitle(videoId, title);
      if (!updated) {
        return {
          success: false,
          data: { error: UpdateVideoTitleErrorType.VIDEO_NOT_FOUND },
        };
      }

      return {
        success: true,
        data: { message: "Title updated successfully" },
      };
    } catch (error) {
      logger.error("Error updating video title:", error);
      return {
        success: false,
        data: { error: UpdateVideoTitleErrorType.INTERNAL_ERROR },
      };
    }
  }
}