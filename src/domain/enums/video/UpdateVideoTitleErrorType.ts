// src/domain/enums/video/UpdateVideoTitleErrorType.ts
export enum UpdateVideoTitleErrorType {
  INVALID_INPUT = "Video ID and title are required",
  VIDEO_NOT_FOUND = "Video not found or title update failed",
  UNAUTHORIZED = "User does not have permission to edit this video",
  INTERNAL_ERROR = "Internal server error",
}