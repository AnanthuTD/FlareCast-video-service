import { ResponseDTO } from "@/domain/dtos/Response";
import { GetPreviewVideoDetailsDTO } from "@/domain/dtos/video/GetPreviewVideoDetailsDTO";
import { GetPreviewVideoDetailsResponseDTO } from "@/domain/dtos/video/GetPreviewVideoDetailsResponseDTO";
import { GetPreviewVideoDetailsErrorType } from "@/domain/enums/video/GetPreviewVideoDetailsErrorType";

export interface IGetPreviewVideoDetailsUseCase {
  execute(
    dto: GetPreviewVideoDetailsDTO
  ): Promise<
    ResponseDTO & {
      data: GetPreviewVideoDetailsResponseDTO | { error: GetPreviewVideoDetailsErrorType };
    }
  >;
}