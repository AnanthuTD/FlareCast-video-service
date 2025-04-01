import { ResponseDTO } from "@/domain/dtos/Response";
import { UpdateVideoTitleDTO } from "@/domain/dtos/video/UpdateVideoTitleDTO";
import { UpdateVideoTitleResponseDTO } from "@/domain/dtos/video/UpdateVideoTitleResponseDTO";
import { UpdateVideoTitleErrorType } from "@/domain/enums/video/UpdateVideoTitleErrorType";

export interface IUpdateVideoTitleUseCase {
  execute(
    dto: UpdateVideoTitleDTO
  ): Promise<
    ResponseDTO & {
      data: UpdateVideoTitleResponseDTO | { error: UpdateVideoTitleErrorType };
    }
  >;
}