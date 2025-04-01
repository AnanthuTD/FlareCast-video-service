// src/domain/dtos/chat/GetChatsDTO.ts
export interface GetChatsDTO {
  videoId: string;
  userId: string;
  cursor?: string;
  limit: number;
}