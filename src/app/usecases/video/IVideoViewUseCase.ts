import { ResponseDTO } from "@/domain/dtos/Response";
import { VideoViewDTO } from "@/domain/dtos/video/VideoViewDTO";
import { VideoViewResponseDTO } from "@/domain/dtos/video/VideoViewResponseDTO";
import { VideoViewErrorType } from "@/domain/enums/video/VideoViewErrorType";


export interface IVideoViewUseCase {
  execute(
    dto: VideoViewDTO
  ): Promise<
    ResponseDTO & {
      data: VideoViewResponseDTO | { error: VideoViewErrorType };
    }
  >;
}