// src/domain/dtos/video/GetPromotionalVideosResponseDTO.ts
export interface PromotionalVideoDTO {
  id: string;
  totalViews: number;
  uniqueViews: number;
  duration: string;
  createdAt: Date;
  thumbnailUrl: string;
  views: number;
  comments: number;
  shares: number;
  userName: string;
  timeAgo: string;
  userAvatarUrl: string | null;
}

export interface GetPromotionalVideosResponseDTO {
  videos: PromotionalVideoDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}