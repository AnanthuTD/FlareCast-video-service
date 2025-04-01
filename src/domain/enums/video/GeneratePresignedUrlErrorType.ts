// src/domain/enums/video/GeneratePresignedUrlErrorType.ts
export enum GeneratePresignedUrlErrorType {
  INVALID_INPUT = "Video ID is required",
  VIDEO_NOT_FOUND = "Video not found",
  UNAUTHORIZED = "User does not have permission to edit this video",
  INTERNAL_ERROR = "Failed to generate presigned URL",
}