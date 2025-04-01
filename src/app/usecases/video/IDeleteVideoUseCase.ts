import { DeleteVideoDTO } from "@/domain/dtos/video/DeleteVideoDTO";
import { DeleteVideoResponseDTO } from "@/domain/dtos/video/DeleteVideoResponseDTO";
import { ResponseDTO } from "@/domain/dtos/Response";
import { DeleteVideoErrorType } from "@/domain/enums/video/DeleteVideoErrorType";

export interface IDeleteVideoUseCase {
  execute(
    dto: DeleteVideoDTO
  ): Promise<
    ResponseDTO & {
      data: DeleteVideoResponseDTO | { error: DeleteVideoErrorType };
    }
  >;
}