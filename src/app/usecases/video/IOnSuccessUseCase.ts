import { ResponseDTO } from "@/domain/dtos/Response";
import { OnSuccessDTO } from "@/domain/dtos/video/OnSuccessDTO";
import { OnSuccessResponseDTO } from "@/domain/dtos/video/OnSuccessResponseDTO";
import { OnSuccessErrorType } from "@/domain/enums/video/OnSuccessErrorType";

export interface IOnSuccessUseCase {
  execute(
    dto: OnSuccessDTO
  ): Promise<
    ResponseDTO & {
      data: OnSuccessResponseDTO | { error: OnSuccessErrorType };
    }
  >;
}