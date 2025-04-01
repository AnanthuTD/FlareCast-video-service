// src/app/usecases/video/IGetVideoDetailsUseCase.ts
import { ResponseDTO } from "@/domain/dtos/Response";
import { GetVideoDetailsDTO } from "@/domain/dtos/video/GetVideoDetailsDTO";
import { GetVideoDetailsResponseDTO } from "@/domain/dtos/video/GetVideoDetailsResponseDTO";
import { GetVideoDetailsErrorType } from "@/domain/enums/video/GetVideoDetailsErrorType";

export interface IGetVideoDetailsUseCase {
  execute(
    dto: GetVideoDetailsDTO
  ): Promise<
    ResponseDTO & {
      data: GetVideoDetailsResponseDTO | { error: GetVideoDetailsErrorType };
    }
  >;
}