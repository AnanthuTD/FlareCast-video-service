import { ChatEntity } from "@/domain/entities/Chat";

export interface IChatRepository{
  createChat(params: {
    videoId: string;
    userId?: string;
    message: string;
    sessionId: string;
    repliedToId?: string;
  }): Promise<ChatEntity>;

  clearSession(sessionId: string): Promise<void>;

  findChatsBySession(params: {
    sessionId: string;
    limit: number;
    cursor?: string;
  }): Promise<ChatEntity[]>;

  findChatHistoryBySession(sessionId: string, limit?: number): Promise<ChatEntity[]>;
}