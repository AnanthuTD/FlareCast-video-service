import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { ISearchVideosUseCase } from "../ISearchVideosUseCase";
import { SearchVideosDTO } from "@/domain/dtos/video/SearchVideosDTO";
import { SearchVideosResponseDTO } from "@/domain/dtos/video/SearchVideosResponseDTO";
import { SearchVideosErrorType } from "@/domain/enums/video/SearchVideosErrorType";
import { logger } from "@/infra/logger";

export class SearchVideosUseCase implements ISearchVideosUseCase {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(
    dto: SearchVideosDTO
  ): Promise<
    ResponseDTO & {
      data: SearchVideosResponseDTO | { error: SearchVideosErrorType };
    }
  > {
    const { query, paginationToken, workspaceId, limit } = dto;

    if (!query || typeof query !== "string" || !workspaceId) {
      return {
        success: false,
        data: { error: SearchVideosErrorType.INVALID_INPUT },
      };
    }

    try {
      const results = await this.videoRepository.searchVideo({
        query,
        limit,
        direction: "searchAfter",
        paginationToken,
        workspaceId,
      });

      return {
        success: true,
        data: { results },
      };
    } catch (error) {
      logger.error("Error searching videos:", error);
      return {
        success: false,
        data: { error: SearchVideosErrorType.INTERNAL_ERROR },
      };
    }
  }
}