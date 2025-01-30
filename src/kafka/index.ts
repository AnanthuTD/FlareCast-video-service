import { TOPICS } from "../config/topics";
import { logger } from "../logger/logger";
import { createTopic } from "./admin";
import { consumeMessages } from "./consumer";
import { handleUserVerifiedEvent } from "./handlers/verifiedUserEvent.handler";
import { handleVideoViewEvent } from "./handlers/videoViewEvent.handler";



// Create topics and start consuming messages
createTopic([TOPICS.VIDEO_EVENTS, TOPICS.VIDEO_VIEW_EVENT]).then(() => {
	logger.info("✅ Topic created successfully");

	// Define topic handlers
	const topicHandlers = {
		[TOPICS.USER_VERIFIED_EVENT]: handleUserVerifiedEvent,
		[TOPICS.VIDEO_VIEW_EVENT]: handleVideoViewEvent,
	};

	// Start consuming messages
	consumeMessages(topicHandlers).catch((error) => {
		logger.error("Failed to start consumer:", error);
	});
});
