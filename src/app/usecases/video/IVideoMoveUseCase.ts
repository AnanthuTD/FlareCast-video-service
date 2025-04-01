import { ResponseDTO } from "@/domain/dtos/Response";
import { VideoMoveDTO } from "@/domain/dtos/video/VideoMoveDTO";
import { VideoMoveResponseDTO } from "@/domain/dtos/video/VideoMoveResponseDTO";
import { VideoMoveErrorType } from "@/domain/enums/video/VideoMoveErrorType";

export interface IVideoMoveUseCase {
  execute(
    dto: VideoMoveDTO
  ): Promise<
    ResponseDTO & {
      data: VideoMoveResponseDTO | { error: VideoMoveErrorType };
    }
  >;
}