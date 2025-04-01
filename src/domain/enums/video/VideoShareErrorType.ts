// src/domain/enums/video/VideoShareErrorType.ts
export enum VideoShareErrorType {
  INVALID_INPUT = "Video ID and Space ID are required",
  VIDEO_NOT_FOUND = "Video not found",
  ALREADY_SHARED = "Video already shared in this space/folder",
  UNAUTHORIZED = "User does not have permission to share in this space/folder",
  INTERNAL_ERROR = "Failed to share video",
}