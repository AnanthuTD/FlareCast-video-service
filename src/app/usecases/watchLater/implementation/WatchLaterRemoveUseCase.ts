import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IWatchLaterRepository } from "@/app/repository/IWatchLaterRepository";
import { IWatchLaterRemoveUseCase } from "../IWatchLaterRemoveUseCase";
import { WatchLaterRemoveDTO } from "@/domain/dtos/watchLater/WatchLaterRemoveDTO";
import { WatchLaterRemoveResponseDTO } from "@/domain/dtos/watchLater/WatchLaterRemoveResponseDTO";
import { WatchLaterRemoveErrorType } from "@/domain/enums/watchLater/WatchLaterRemoveErrorType";
import { logger } from "@/infra/logger";

export class WatchLaterRemoveUseCase implements IWatchLaterRemoveUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly watchLaterRepository: IWatchLaterRepository
  ) {}

  async execute(
    dto: WatchLaterRemoveDTO
  ): Promise<
    ResponseDTO & {
      data: WatchLaterRemoveResponseDTO | { error: WatchLaterRemoveErrorType };
    }
  > {
    const { userId, videoId } = dto;

    if (!videoId) {
      return {
        success: false,
        data: { error: WatchLaterRemoveErrorType.INVALID_INPUT },
      };
    }

    try {
      const video = await this.videoRepository.findById(videoId);
      if (!video) {
        return {
          success: false,
          data: { error: WatchLaterRemoveErrorType.VIDEO_NOT_FOUND },
        };
      }

      const watchLater = await this.watchLaterRepository.remove({
        videoId,
        userId,
        workspaceId: video.workspaceId,
      });

      return {
        success: true,
        data: {
          message: "Video removed from watch later successfully",
          watchLater,
        },
      };
    } catch (error) {
      logger.error(`Failed to remove video ${videoId} from watch later: ${error instanceof Error ? error.message : error}`);
      return {
        success: false,
        data: { error: WatchLaterRemoveErrorType.INTERNAL_ERROR },
      };
    }
  }
}