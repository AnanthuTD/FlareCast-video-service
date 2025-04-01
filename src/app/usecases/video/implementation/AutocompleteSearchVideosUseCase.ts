import { ResponseDTO } from "@/domain/dtos/Response";
import { IAutocompleteSearchVideosUseCase } from "../IAutocompleteSearchVideosUseCase";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { AutocompleteSearchVideosDTO } from "@/domain/dtos/video/AutocompleteSearchVideosDTO";
import { AutocompleteSearchVideosResponseDTO } from "@/domain/dtos/video/AutocompleteSearchVideosResponseDTO";
import { AutocompleteSearchVideosErrorType } from "@/domain/enums/video/AutocompleteSearchVideosErrorType";
import { logger } from "@/infra/logger";


export class AutocompleteSearchVideosUseCase implements IAutocompleteSearchVideosUseCase {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(
    dto: AutocompleteSearchVideosDTO
  ): Promise<
    ResponseDTO & {
      data: AutocompleteSearchVideosResponseDTO | { error: AutocompleteSearchVideosErrorType };
    }
  > {
    const { query, workspaceId, limit, paginationToken, direction } = dto;

    // Validation: Ensure required fields are present
    if (!query || !workspaceId) {
      return {
        success: false,
        data: { error: AutocompleteSearchVideosErrorType.MISSING_FIELDS },
      };
    }

    logger.debug(`Autocomplete search: query=${query}, workspaceId=${workspaceId}`);

    try {
      const results = await this.videoRepository.suggestVideos({
        query,
        limit,
        workspaceId,
        paginationToken,
        direction,
      });

      return {
        success: true,
        data: { results },
      };
    } catch (error) {
      logger.error("Error in autocomplete search:", error);
      return {
        success: false,
        data: { error: AutocompleteSearchVideosErrorType.INTERNAL_ERROR },
      };
    }
  }
}