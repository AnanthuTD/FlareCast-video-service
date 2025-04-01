import { ResponseDTO } from "@/domain/dtos/Response";
import { SearchVideosDTO } from "@/domain/dtos/video/SearchVideosDTO";
import { SearchVideosResponseDTO } from "@/domain/dtos/video/SearchVideosResponseDTO";
import { SearchVideosErrorType } from "@/domain/enums/video/SearchVideosErrorType";
export interface ISearchVideosUseCase {
  execute(
    dto: SearchVideosDTO
  ): Promise<
    ResponseDTO & {
      data: SearchVideosResponseDTO | { error: SearchVideosErrorType };
    }
  >;
}