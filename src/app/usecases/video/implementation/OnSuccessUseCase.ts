import { ResponseDTO } from "@/domain/dtos/Response";
import { OnSuccessDTO } from "@/domain/dtos/video/OnSuccessDTO";
import { OnSuccessResponseDTO } from "@/domain/dtos/video/OnSuccessResponseDTO";
import { OnSuccessErrorType } from "@/domain/enums/video/OnSuccessErrorType";
import { IOnSuccessUseCase } from "../IOnSuccessUseCase";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IEventService } from "@/app/services/IEventService";
import { logger } from "@/infra/logger";

export class OnSuccessUseCase implements IOnSuccessUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly eventService: IEventService
  ) {}

  async execute(
    dto: OnSuccessDTO
  ): Promise<
    ResponseDTO & {
      data: OnSuccessResponseDTO | { error: OnSuccessErrorType };
    }
  > {
    const { userId, videoId, key, status } = dto;

    if (!videoId || !key || !status) {
      return {
        success: false,
        data: { error: OnSuccessErrorType.INVALID_INPUT },
      };
    }

    try {
      logger.debug("Processing onSuccess for video upload");

      if (status !== "success") {
        await this.videoRepository.delete(videoId);
        return {
          success: true,
          data: { message: "Video deleted successfully since editing failed!" },
        };
      }

      await this.eventService.sendVideoUploadEvent({
        s3Key: key,
        videoId,
        userId,
      });

      return {
        success: true,
        data: { message: "Video upload succeeded and is in processing stage" },
      };
    } catch (error) {
      logger.error("Error in onSuccess handler:", error);
      return {
        success: false,
        data: { error: OnSuccessErrorType.INTERNAL_ERROR },
      };
    }
  }
}