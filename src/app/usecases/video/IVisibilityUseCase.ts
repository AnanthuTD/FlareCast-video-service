import { ResponseDTO } from "@/domain/dtos/Response";
import { VisibilityDTO } from "@/domain/dtos/video/VisibilityDTO";
import { VisibilityResponseDTO } from "@/domain/dtos/video/VisibilityResponseDTO";
import { VisibilityErrorType } from "@/domain/enums/video/VisibilityErrorType";

export interface IVisibilityUseCase {
  execute(
    dto: VisibilityDTO
  ): Promise<
    ResponseDTO & {
      data: VisibilityResponseDTO | { error: VisibilityErrorType };
    }
  >;
}