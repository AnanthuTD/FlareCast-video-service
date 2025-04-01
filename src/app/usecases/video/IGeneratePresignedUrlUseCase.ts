import { ResponseDTO } from "@/domain/dtos/Response";
import { GeneratePresignedUrlDTO } from "@/domain/dtos/video/GeneratePresignedUrlDTO";
import { GeneratePresignedUrlResponseDTO } from "@/domain/dtos/video/GeneratePresignedUrlResponseDTO";
import { GeneratePresignedUrlErrorType } from "@/domain/enums/video/GeneratePresignedUrlErrorType";

export interface IGeneratePresignedUrlUseCase {
  execute(
    dto: GeneratePresignedUrlDTO
  ): Promise<
    ResponseDTO & {
      data: GeneratePresignedUrlResponseDTO | { error: GeneratePresignedUrlErrorType };
    }
  >;
}