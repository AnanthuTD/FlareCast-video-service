import { GetPromotionalVideosDTO } from "@/domain/dtos/promotionalVideo/GetPromotionalVideosDTO";
import { GetPromotionalVideosResponseDTO } from "@/domain/dtos/promotionalVideo/GetPromotionalVideosResponseDTO";
import { ResponseDTO } from "@/domain/dtos/Response";
import { GetPromotionalVideosErrorType } from "@/domain/enums/promotionalVideo/GetPromotionalVideosErrorType";

export interface IGetPromotionalVideosUseCase {
  execute(
    dto: GetPromotionalVideosDTO
  ): Promise<
    ResponseDTO & {
      data: GetPromotionalVideosResponseDTO | { error: GetPromotionalVideosErrorType };
    }
  >;
}