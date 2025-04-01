// src/domain/dtos/video/GeneratePresignedUrlResponseDTO.ts
export interface GeneratePresignedUrlResponseDTO {
  signedUrl: string;
  videoId: string;
  key: string;
}