// src/domain/enums/video/DeleteVideoErrorType.ts
export enum DeleteVideoErrorType {
  INVALID_INPUT = "Invalid input: videoId and userId are required",
  VIDEO_NOT_FOUND = "Video not found",
  UNAUTHORIZED = "User is not authorized to delete this video",
  INTERNAL_ERROR = "Failed to delete video",
}