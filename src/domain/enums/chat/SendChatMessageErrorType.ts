export enum SendChatMessageErrorType {
  MISSING_FIELDS = "Missing videoId, query, or userId",
  VIDEO_NOT_FOUND = "Video not found",
  SERVICE_UNAVAILABLE = "Chat service unavailable",
}