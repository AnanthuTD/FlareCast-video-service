import { ResponseDTO } from "@/domain/dtos/Response";
import { UpdateVideoDescriptionDTO } from "@/domain/dtos/video/UpdateVideoDescriptionDTO";
import { UpdateVideoDescriptionResponseDTO } from "@/domain/dtos/video/UpdateVideoDescriptionResponseDTO";
import { UpdateVideoDescriptionErrorType } from "@/domain/enums/video/UpdateVideoDescriptionErrorType";

export interface IUpdateVideoDescriptionUseCase {
  execute(
    dto: UpdateVideoDescriptionDTO
  ): Promise<
    ResponseDTO & {
      data: UpdateVideoDescriptionResponseDTO | { error: UpdateVideoDescriptionErrorType };
    }
  >;
}