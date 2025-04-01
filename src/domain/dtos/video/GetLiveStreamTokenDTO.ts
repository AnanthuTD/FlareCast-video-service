// src/domain/dtos/video/GetLiveStreamTokenDTO.ts
export interface GetLiveStreamTokenDTO {
  userId: string;
  workspaceId?: string;
  folderId?: string;
  spaceId?: string;
}