import { CreatePromotionalVideoDTO } from "@/domain/dtos/promotionalVideo/CreatePromotionalVideoDTO";
import { CreatePromotionalVideoResponseDTO } from "@/domain/dtos/promotionalVideo/CreatePromotionalVideoResponseDTO";
import { ResponseDTO } from "@/domain/dtos/Response";
import { CreatePromotionalVideoErrorType } from "@/domain/enums/promotionalVideo/CreatePromotionalVideoErrorType";

export interface ICreatePromotionalVideoUseCase {
  execute(
    dto: CreatePromotionalVideoDTO
  ): Promise<
    ResponseDTO & {
      data: CreatePromotionalVideoResponseDTO | { error: CreatePromotionalVideoErrorType };
    }
  >;
}