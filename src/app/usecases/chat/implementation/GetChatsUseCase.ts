import { ResponseDTO } from "@/domain/dtos/Response";
import { GetChatsDTO } from "@/domain/dtos/chat/GetChatsDTO";
import { GetChatsResponseDTO } from "@/domain/dtos/chat/GetChatsResponseDTO";
import { IGetChatsUseCase } from "../IGetChatsUseCase";
import { IChatRepository } from "@/app/repository/IChatRepository";
import { GetChatsErrorType } from "@/domain/enums/chat/GetChatsErrorType";

export class GetChatsUseCase implements IGetChatsUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(
    dto: GetChatsDTO
  ): Promise<
    ResponseDTO & {
      data: GetChatsResponseDTO | { error: GetChatsErrorType };
    }
  > {
    const { videoId, userId, cursor, limit } = dto;

    if (isNaN(limit) || limit <= 0) {
      return {
        success: false,
        data: { error: GetChatsErrorType.INVALID_LIMIT },
      };
    }

    const sessionId = `videoId${videoId}-userId-${userId}`;
    const chats = await this.chatRepository.findChatsBySession({
      sessionId,
      limit: limit + 1, // Fetch one extra to determine nextCursor
      cursor,
    });

    const hasNextPage = chats.length > limit;
    const resultChats = hasNextPage ? chats.slice(0, -1) : chats;
    const nextCursor = hasNextPage
      ? `${resultChats[resultChats.length - 1].createdAt.toISOString()}_${
          resultChats[resultChats.length - 1].id
        }`
      : null;

    return {
      success: true,
      data: {
        chats: resultChats.map((chat) => ({
          id: chat.id,
          user: chat.user ?? { fullName: "", id: "ai" },
          message: chat.message,
          repliedTo: chat.repliedTo,
          videoId: chat.videoId,
          createdAt: chat.createdAt,
          sessionId: chat.sessionId,
        })),
        nextCursor,
      },
    };
  }
}