export interface WatchLaterGetResponseDTO {
  videos: any[]; 
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}