// src/domain/dtos/chat/GetChatsResponseDTO.ts
import { ChatEntity } from "@/domain/entities/Chat";

export interface GetChatsResponseDTO {
  chats: {
    id: string;
    user: { id: string; fullName: string } | { id: "ai"; fullName: "" };
    message: string;
    repliedTo: ChatEntity | null;
    videoId: string;
    createdAt: Date;
    sessionId: string;
  }[];
  nextCursor: string | null;
}