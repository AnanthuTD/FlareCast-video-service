import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoViewUseCase } from "../IVideoViewUseCase";
import { IEventService } from "@/app/services/IEventService";
import { VideoViewDTO } from "@/domain/dtos/video/VideoViewDTO";
import { VideoViewResponseDTO } from "@/domain/dtos/video/VideoViewResponseDTO";
import { VideoViewErrorType } from "@/domain/enums/video/VideoViewErrorType";
import { logger } from "@/infra/logger";

export class VideoViewUseCase implements IVideoViewUseCase {
  constructor(private readonly eventService: IEventService) {}

  async execute(
    dto: VideoViewDTO
  ): Promise<
    ResponseDTO & {
      data: VideoViewResponseDTO | { error: VideoViewErrorType };
    }
  > {
    const { userId, videoId } = dto;

    if (!userId || !videoId) {
      return {
        success: false,
        data: { error: VideoViewErrorType.INVALID_INPUT },
      };
    }

    try {
      await this.eventService.sendVideoViewEvent({
        videoId,
        userId,
        createdAt: new Date(),
      });

      return {
        success: true,
        data: {
          accepted: true,
          message: "View processing started",
        },
      };
    } catch (error) {
      logger.error(`Failed to send video view event for video ${videoId}: ${error instanceof Error ? error.message : error}`);
      return {
        success: false,
        data: { error: VideoViewErrorType.INTERNAL_ERROR },
      };
    }
  }
}