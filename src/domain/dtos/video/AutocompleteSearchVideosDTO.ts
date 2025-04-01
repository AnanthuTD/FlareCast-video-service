// src/domain/dtos/video/AutocompleteSearchVideosDTO.ts
export interface AutocompleteSearchVideosDTO {
  query: string;
  workspaceId: string;
  limit: number;
  paginationToken: string;
  direction: "searchAfter" | "searchBefore";
}