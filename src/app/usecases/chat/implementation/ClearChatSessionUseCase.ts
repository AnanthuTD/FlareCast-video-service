import { ResponseDTO } from "@/domain/dtos/Response";
import { ClearChatSessionDTO } from "@/domain/dtos/chat/ClearChatSessionDTO";
import { ClearChatSessionResponseDTO } from "@/domain/dtos/chat/ClearChatSessionResponseDTO";
import { IClearChatSessionUseCase } from "../IClearChatSessionUseCase";
import { IChatRepository } from "@/app/repository/IChatRepository";
import { ClearChatSessionErrorType } from "@/domain/enums/chat/ClearChatSessionErrorType";

export class ClearChatSessionUseCase implements IClearChatSessionUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(
    dto: ClearChatSessionDTO
  ): Promise<
    ResponseDTO & {
      data: ClearChatSessionResponseDTO | { error: ClearChatSessionErrorType };
    }
  > {
    const { videoId, sessionId, userId } = dto;

    if (!videoId || !sessionId) {
      return {
        success: false,
        data: { error: ClearChatSessionErrorType.MISSING_FIELDS },
      };
    }

    await this.chatRepository.clearSession(sessionId);

    return {
      success: true,
      data: {
        message: `Session ${sessionId} cleared`,
      },
    };
  }
}