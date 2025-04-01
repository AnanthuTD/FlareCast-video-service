// src/domain/enums/video/GetVideoDetailsErrorType.ts
export enum GetVideoDetailsErrorType {
  VIDEO_NOT_FOUND = "Video not found",
  UNAUTHORIZED = "User don't have access rights to this video",
  PERMISSION_CHECK_FAILED = "Failed to check user permission",
  INTERNAL_ERROR = "Internal server error",
}