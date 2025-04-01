import { ResponseDTO } from "@/domain/dtos/Response";
import { VideoShareDTO } from "@/domain/dtos/video/VideoShareDTO";
import { VideoShareResponseDTO } from "@/domain/dtos/video/VideoShareResponseDTO";
import { VideoShareErrorType } from "@/domain/enums/video/VideoShareErrorType";

export interface IVideoShareUseCase {
  execute(
    dto: VideoShareDTO
  ): Promise<
    ResponseDTO & {
      data: VideoShareResponseDTO | { error: VideoShareErrorType };
    }
  >;
}