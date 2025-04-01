import { ResponseDTO } from "@/domain/dtos/Response";
import { GetVideosDTO } from "@/domain/dtos/video/GetVideosDTO";
import { GetVideosResponseDTO } from "@/domain/dtos/video/GetVideosResponseDTO";
import { GetVideosErrorType } from "@/domain/enums/video/GetVideosErrorType";

export interface IGetVideosUseCase {
  execute(
    dto: GetVideosDTO
  ): Promise<
    ResponseDTO & {
      data: GetVideosResponseDTO | { error: GetVideosErrorType };
    }
  >;
}