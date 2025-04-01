import { ResponseDTO } from "@/domain/dtos/Response";
import env from "@/infra/env";
import { IGetVideosUseCase } from "../IGetVideosUseCase";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { GetVideosDTO } from "@/domain/dtos/video/GetVideosDTO";
import { GetVideosResponseDTO } from "@/domain/dtos/video/GetVideosResponseDTO";
import { GetVideosErrorType } from "@/domain/enums/video/GetVideosErrorType";
import { getTimeAgo, getVideoDurationFormatted } from "@/app/utility/timeUtils";

export class GetVideosUseCase implements IGetVideosUseCase {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(
    dto: GetVideosDTO
  ): Promise<
    ResponseDTO & {
      data: GetVideosResponseDTO | { error: GetVideosErrorType };
    }
  > {
    const { userId, workspaceId, skip, limit, folderId, spaceId } = dto;

    // Validate inputs
    if (!userId || !workspaceId) {
      return {
        success: false,
        data: { error: GetVideosErrorType.INVALID_INPUT },
      };
    }

    const skipNum = Math.max(skip, 0);
    const limitNum = Math.max(limit, 1);

    try {
      // Build query
      const query: any = {
        workspaceId,
      };
  
      // If folderId is provided, filter by folderId; otherwise, filter for no folderId or null
      if (folderId) {
        query.folderId = folderId as string;
      } else {
        query.folderId = {
          isSet: false,
        };
      }
  
      // If spaceId is provided, filter by spaceId; otherwise, filter for no spaceId or null
      if (spaceId) {
        query.spaceId = spaceId as string;
      } else {
        query.spaceId = {
          isSet: false, // Field does not exist
        };
      }
  
      // If neither folderId nor spaceId is provided, filter by userId
      if (!folderId && !spaceId) {
        query.userId = dto.userId;
      }

      console.log(query)

      // Fetch videos
      const videos = await this.videoRepository.findVideos(query, skipNum, limitNum);

      // Enrich video data
      const videosWithThumbnail = videos.map((v) => ({
        id: v.id,
        title: v.title,
        user: v.user,
        totalViews: v.totalViews ?? 0,
        uniqueViews: v.uniqueViews ?? 0,
        duration: getVideoDurationFormatted(v.duration),
        createdAt: v.createdAt,
        thumbnailUrl: v.thumbnailStatus ? `${env.AWS_CLOUDFRONT_URL}/${v.id}/thumbnails/thumb00001.jpg` : null,
        views: v.totalViews ?? 0,
        comments: 6, // Static; replace with actual data if available
        shares: 10, // Static; replace with actual data if available
        userName: v.user?.fullName ?? "Unknown User",
        timeAgo: getTimeAgo(v.createdAt),
        userAvatarUrl: v.user?.image ?? null,
      }));

      // Calculate pagination metadata
      const totalCount = await this.videoRepository.countVideos(query);
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
      console.error(error);
      return {
        success: false,
        data: { error: GetVideosErrorType.INTERNAL_ERROR },
      };
    }
  }
}