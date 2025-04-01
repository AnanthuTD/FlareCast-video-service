import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IWatchLaterRepository } from "@/app/repository/IWatchLaterRepository";
import { IWatchLaterAddUseCase } from "../IWatchLaterAddUseCase";
import { WatchLaterAddDTO } from "@/domain/dtos/watchLater/WatchLaterAddDTO";
import { WatchLaterAddResponseDTO } from "@/domain/dtos/watchLater/WatchLaterAddResponseDTO";
import { WatchLaterAddErrorType } from "@/domain/enums/watchLater/WatchLaterAddErrorType";
import { logger } from "@/infra/logger";

export class WatchLaterAddUseCase implements IWatchLaterAddUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly watchLaterRepository: IWatchLaterRepository
  ) {}

  async execute(
    dto: WatchLaterAddDTO
  ): Promise<
    ResponseDTO & {
      data: WatchLaterAddResponseDTO | { error: WatchLaterAddErrorType };
    }
  > {
    const { userId, videoId } = dto;

    if (!videoId) {
      return {
        success: false,
        data: { error: WatchLaterAddErrorType.INVALID_INPUT },
      };
    }

    try {
      const video = await this.videoRepository.findById(videoId);
      if (!video) {
        return {
          success: false,
          data: { error: WatchLaterAddErrorType.VIDEO_NOT_FOUND },
        };
      }

      const watchLater = await this.watchLaterRepository.add({
        videoId,
        userId,
        workspaceId: video.workspaceId,
      });

      return {
        success: true,
        data: {
          message: "Video added to watch later successfully",
          watchLater,
        },
      };
    } catch (error) {
      logger.error(`Failed to add video ${videoId} to watch later: ${error instanceof Error ? error.message : error}`);
      return {
        success: false,
        data: { error: WatchLaterAddErrorType.INTERNAL_ERROR },
      };
    }
  }
}