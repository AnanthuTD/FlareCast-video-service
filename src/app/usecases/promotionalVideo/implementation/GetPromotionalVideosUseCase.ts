import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import env from "@/infra/env";
import { IGetPromotionalVideosUseCase } from "../IGetPromotionalVideosUseCase";
import { GetPromotionalVideosDTO } from "@/domain/dtos/promotionalVideo/GetPromotionalVideosDTO";
import { GetPromotionalVideosResponseDTO } from "@/domain/dtos/promotionalVideo/GetPromotionalVideosResponseDTO";
import { GetPromotionalVideosErrorType } from "@/domain/enums/promotionalVideo/GetPromotionalVideosErrorType";
import { getTimeAgo, getVideoDurationFormatted } from "@/app/utility/timeUtils";

export class GetPromotionalVideosUseCase implements IGetPromotionalVideosUseCase {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(
    dto: GetPromotionalVideosDTO
  ): Promise<
    ResponseDTO & {
      data: GetPromotionalVideosResponseDTO | { error: GetPromotionalVideosErrorType };
    }
  > {
    const { skip, limit } = dto;

    // Validate pagination parameters
    const skipNum = Math.max(skip, 0);
    const limitNum = Math.max(limit, 1);

    try {
      // Fetch promotional videos
      const videos = await this.videoRepository.findPromotionalVideos(skipNum, limitNum);

      // Enrich video data
      const videosWithThumbnail = videos.map((v) => ({
        id: v.id,
        totalViews: v.totalViews ?? 0,
        uniqueViews: v.uniqueViews ?? 0,
        duration: getVideoDurationFormatted(v.duration),
        createdAt: v.createdAt,
        thumbnailUrl: `${env.AWS_CLOUDFRONT_URL}/${v.id}/thumbnails/thumb00001.jpg`,
        views: v.totalViews ?? 0,
        comments: 6, // Static for now; replace with actual data if available
        shares: 10, // Static for now; replace with actual data if available
        userName: "Admin", // Static; adjust if user data is available
        timeAgo: getTimeAgo(v.createdAt),
        userAvatarUrl: null, // Static; adjust if user data is available
      }));

      // Calculate pagination metadata
      const totalCount = await this.videoRepository.countPromotionalVideos();
      const totalPages = Math.ceil(totalCount / limitNum);
      const hasNext = skipNum + videos.length < totalCount;
      const hasPrev = skipNum > 0;

      return {
        success: true,
        data: {
          videos: videosWithThumbnail,
          totalCount,
          page: Math.floor(skipNum / limitNum) + 1,
          pageSize: limitNum,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: { error: GetPromotionalVideosErrorType.INTERNAL_ERROR },
      };
    }
  }
}