import { SendChatMessageDTO } from "@/domain/dtos/chat/SendChatMessageDTO";
import { SendChatMessageResponseDTO } from "@/domain/dtos/chat/SendChatMessageResponseDTO";
import { ResponseDTO } from "@/domain/dtos/Response";
import { SendChatMessageErrorType } from "@/domain/enums/chat/SendChatMessageErrorType";

export interface ISendChatMessageUseCase {
  execute(
    dto: SendChatMessageDTO
  ): Promise<
    ResponseDTO & {
      data: SendChatMessageResponseDTO | { error: SendChatMessageErrorType };
    }
  >;
}