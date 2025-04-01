import { AutocompleteSearchVideosDTO } from "@/domain/dtos/video/AutocompleteSearchVideosDTO";
import { AutocompleteSearchVideosResponseDTO } from "@/domain/dtos/video/AutocompleteSearchVideosResponseDTO";
import { ResponseDTO } from "@/domain/dtos/Response";
import { AutocompleteSearchVideosErrorType } from "@/domain/enums/video/AutocompleteSearchVideosErrorType";

export interface IAutocompleteSearchVideosUseCase {
  execute(
    dto: AutocompleteSearchVideosDTO
  ): Promise<
    ResponseDTO & {
      data: AutocompleteSearchVideosResponseDTO | { error: AutocompleteSearchVideosErrorType };
    }
  >;
}