import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IWatchLaterRepository } from "@/app/repository/IWatchLaterRepository";
import env from "@/infra/env";
import { IWatchLaterGetUseCase } from "../IWatchLaterGetUseCase";
import { WatchLaterGetDTO } from "@/domain/dtos/watchLater/WatchLaterGetDTO";
import { WatchLaterGetResponseDTO } from "@/domain/dtos/watchLater/WatchLaterGetResponseDTO";
import { WatchLaterGetErrorType } from "@/domain/enums/watchLater/WatchLaterGetErrorType";
import { getTimeAgo, getVideoDurationFormatted } from "@/app/utility/timeUtils";
import { logger } from "@/infra/logger";

export class WatchLaterGetUseCase implements IWatchLaterGetUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly watchLaterRepository: IWatchLaterRepository
  ) {}

  async execute(
    dto: WatchLaterGetDTO
  ): Promise<
    ResponseDTO & {
      data: WatchLaterGetResponseDTO | { error: WatchLaterGetErrorType };
    }
  > {
    const { userId, workspaceId, page, limit } = dto;

    if (!workspaceId || page < 1 || limit < 1) {
      return {
        success: false,
        data: { error: WatchLaterGetErrorType.INVALID_INPUT },
      };
    }

    try {
      const skip = (page - 1) * limit;
      const watchLater = await this.watchLaterRepository.findByUserIdAndWorkspaceId(userId, workspaceId);

      if (!watchLater || !watchLater.videoIds.length) {
        return {
          success: true,
          data: {
            videos: [],
            totalCount: 0,
            page,
            pageSize: limit,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      const videos = await this.videoRepository.findManyByIds(watchLater.videoIds, skip, limit);

      const videosWithThumbnail = videos.map((v) => ({
        ...v,
        thumbnailUrl: `${env.AWS_CLOUDFRONT_URL}/${v.id}/thumbnails/thumb00001.jpg`,
        views: v.totalViews ?? 0,
        uniqueViews: v.uniqueViews ?? 0,
        comments: 6, // Placeholder
        duration: getVideoDurationFormatted(v.duration),
        shares: 10, // Placeholder
        userName: v.user?.fullName ?? "Unknown User",
        timeAgo: getTimeAgo(v.createdAt),
        userAvatarUrl: v.user?.image ?? null,
      }));

      const totalCount = watchLater.videoIds.length;
      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = skip + videos.length < totalCount;
      const hasPrev = page > 1;

      return {
        success: true,
        data: {
          videos: videosWithThumbnail,
          totalCount,
          page,
          pageSize: limit,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      logger.error(`Failed to get watch later videos: ${error instanceof Error ? error.message : error}`);
      return {
        success: false,
        data: { error: WatchLaterGetErrorType.INTERNAL_ERROR },
      };
    }
  }
}