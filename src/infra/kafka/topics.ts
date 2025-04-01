export enum TOPICS {
	VIDEO_VIEW_EVENT = "video-view-event",
	USER_VERIFIED_EVENT = "user-events",
	VIDEO_EVENTS = "video-events",
	NOTIFICATION_EVENT = "notification-event",

	VIDEO_UPLOAD_EVENT = "video.upload",
	VIDEO_PROCESSED_EVENT = "video.processed",
	VIDEO_TRANSCODE_EVENT = "video.transcode",
	THUMBNAIL_EVENT = "thumbnail",
	VIDEO_TRANSCRIPTION_EVENT = "video.transcription",
	VIDEO_SUMMARY_TITLE_EVENT = "video.summary.title",
	VIDEO_REMOVED_EVENT = "video.removed",
	LIVE_STREAM_EVENT = "live.stream",

	SELECTED_WORKSPACE_PENDING = "workspace.validation.pending",
	SELECTED_WORKSPACE_VALIDATED = "video.workspace.validated",

	SUBSCRIPTION_VALIDATED = "video.subscription.validated",
	VIDEO_CREATED_EVENT = "video.created",
	VIDEO_PROCESS_REQUEST_EVENT = "video.process.requested",

	FIRST_VIEW = "firstView",
}
