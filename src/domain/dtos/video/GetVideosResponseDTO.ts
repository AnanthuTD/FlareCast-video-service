// src/domain/dtos/video/GetVideosResponseDTO.ts
export interface VideoDTO {
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

export interface GetVideosResponseDTO {
  videos: VideoDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}