import { GetChatsDTO } from "@/domain/dtos/chat/GetChatsDTO";
import { GetChatsResponseDTO } from "@/domain/dtos/chat/GetChatsResponseDTO";
import { ResponseDTO } from "@/domain/dtos/Response";
import { GetChatsErrorType } from "@/domain/enums/chat/GetChatsErrorType";

export interface IGetChatsUseCase {
  execute(
    dto: GetChatsDTO
  ): Promise<
    ResponseDTO & {
      data: GetChatsResponseDTO | { error: GetChatsErrorType };
    }
  >;
}