// src/domain/dtos/video/SearchVideosDTO.ts
export interface SearchVideosDTO {
  query: string;
  paginationToken?: string;
  workspaceId: string;
  limit: number;
}