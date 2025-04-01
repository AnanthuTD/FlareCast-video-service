// src/domain/dtos/video/GetVideosDTO.ts
export interface GetVideosDTO {
  userId: string;
  workspaceId: string;
  skip: number;
  limit: number;
  folderId?: string;
  spaceId?: string;
}