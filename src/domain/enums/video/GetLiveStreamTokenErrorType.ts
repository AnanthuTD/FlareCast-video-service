// src/domain/enums/video/GetLiveStreamTokenErrorType.ts
export enum GetLiveStreamTokenErrorType {
  INVALID_INPUT = "Invalid input: userId is required",
  NO_WORKSPACE_SELECTED = "No workspace selected",
  INTERNAL_ERROR = "Failed to generate live stream token",
}