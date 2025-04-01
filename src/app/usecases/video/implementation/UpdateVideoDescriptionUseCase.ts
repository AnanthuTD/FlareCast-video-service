import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IUpdateVideoDescriptionUseCase } from "../IUpdateVideoDescriptionUseCase";
import { UpdateVideoDescriptionDTO } from "@/domain/dtos/video/UpdateVideoDescriptionDTO";
import { UpdateVideoDescriptionResponseDTO } from "@/domain/dtos/video/UpdateVideoDescriptionResponseDTO";
import { UpdateVideoDescriptionErrorType } from "@/domain/enums/video/UpdateVideoDescriptionErrorType";
import { logger } from "@/infra/logger";

export class UpdateVideoDescriptionUseCase implements IUpdateVideoDescriptionUseCase {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(
    dto: UpdateVideoDescriptionDTO
  ): Promise<
    ResponseDTO & {
      data: UpdateVideoDescriptionResponseDTO | { error: UpdateVideoDescriptionErrorType };
    }
  > {
    const { userId, videoId, description } = dto;

    if (!videoId || !description) {
      return {
        success: false,
        data: { error: UpdateVideoDescriptionErrorType.INVALID_INPUT },
      };
    }

    try {
      // Check if video exists and user has permission
      const video = await this.videoRepository.findById(videoId);
      if (!video) {
        return {
          success: false,
          data: { error: UpdateVideoDescriptionErrorType.VIDEO_NOT_FOUND },
        };
      }

      if (video.userId !== userId) {
        // TODO: Add more sophisticated permission logic if needed (e.g., workspace roles)
        return {
          success: false,
          data: { error: UpdateVideoDescriptionErrorType.UNAUTHORIZED },
        };
      }

      const updated = await this.videoRepository.updateDescription(videoId, description);
      if (!updated) {
        return {
          success: false,
          data: { error: UpdateVideoDescriptionErrorType.VIDEO_NOT_FOUND },
        };
      }

      return {
        success: true,
        data: { message: "Description updated successfully" },
      };
    } catch (error) {
      logger.error("Error updating video description:", error);
      return {
        success: false,
        data: { error: UpdateVideoDescriptionErrorType.INTERNAL_ERROR },
      };
    }
  }
}