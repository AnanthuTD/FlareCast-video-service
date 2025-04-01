import { ClearChatSessionDTO } from "@/domain/dtos/chat/ClearChatSessionDTO";
import { ClearChatSessionResponseDTO } from "@/domain/dtos/chat/ClearChatSessionResponseDTO";
import { ResponseDTO } from "@/domain/dtos/Response";
import { ClearChatSessionErrorType } from "@/domain/enums/chat/ClearChatSessionErrorType";

export interface IClearChatSessionUseCase {
  execute(
    dto: ClearChatSessionDTO
  ): Promise<
    ResponseDTO & {
      data: ClearChatSessionResponseDTO | { error: ClearChatSessionErrorType };
    }
  >;
}