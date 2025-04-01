// src/domain/enums/video/UpdateVideoDescriptionErrorType.ts
export enum UpdateVideoDescriptionErrorType {
  INVALID_INPUT = "Video ID and description are required",
  VIDEO_NOT_FOUND = "Video not found or description update failed",
  UNAUTHORIZED = "User does not have permission to edit this video",
  INTERNAL_ERROR = "Internal server error",
}