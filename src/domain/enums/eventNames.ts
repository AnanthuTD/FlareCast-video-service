enum EventName {
	SUBSCRIPTION_STATUS_UPDATE = "subscription:status:update",

	// admin
	ACTIVE_USERS_COUNT = "active:users:count",
	NEW_USER_SIGNUP = "new:users:signup",
	NEW_VIDEO_UPLOAD = "new:video:upload",
	ONGOING_LIVE_STREAM = "ongoing:live:stream",
	VIDEO_TRANSCODE = "video:transcode",
	VIDEO_PROCESSED = "video:processed",
	TRANSCRIPTION = "transcription",
	TITLE_SUMMARY = "title:summary",
	THUMBNAIL = "thumbnail",
	SUBSCRIPTION_UPDATE = "subscription:update",
	LIVE_STREAMING = "live:streaming",
	ADMIN_DASHBOARD_INITIAL_DATA="initial:data"
}

export default EventName;
