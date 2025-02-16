import { TOPICS } from "../config/topics";
import { logger } from "../logger/logger";
import { createTopic } from "./admin";
import { consumeMessages } from "./consumer";
import { handleThumbnailEvent } from "./handlers/thumbnailEvent.consumer";
import { handleTitleAndSummary } from "./handlers/titleAndDiscriptionEvent.consumer";
import { handleTranscriptionEvent } from "./handlers/transcriptionEvent.consumer";
import { handleUserVerifiedEvent } from "./handlers/verifiedUserEvent.handler";
import { handleVideoProcessedEvent } from "./handlers/videoProcessedEvent.consumer";
import { handleVideoTranscodeEvent } from "./handlers/videoTranscodeEvent.consumer";
import { handleVideoViewEvent } from "./handlers/videoViewEvent.handler";



// Create topics and start consuming messages
createTopic(Object.values(TOPICS)).then(() => {
	logger.info("✅ Topic created successfully");

	// Define topic handlers
	const topicHandlers = {
		[TOPICS.USER_VERIFIED_EVENT]: handleUserVerifiedEvent,
		[TOPICS.VIDEO_VIEW_EVENT]: handleVideoViewEvent,

		[TOPICS.VIDEO_PROCESSED_EVENT]: handleVideoProcessedEvent,
		[TOPICS.VIDEO_TRANSCODE_EVENT]: handleVideoTranscodeEvent,
		[TOPICS.VIDEO_TRANSCRIPTION_EVENT]: handleTranscriptionEvent,
		[TOPICS.THUMBNAIL_EVENT]: handleThumbnailEvent,
    [TOPICS.VIDEO_SUMMARY_TITLE_EVENT]: handleTitleAndSummary,
	};

	// Start consuming messages
	consumeMessages(topicHandlers).catch((error) => {
		logger.error("Failed to start consumer:", error);
	});
});
