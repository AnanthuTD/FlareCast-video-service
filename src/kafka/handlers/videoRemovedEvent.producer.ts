import { TOPICS } from "../../config/topics";
import { logger } from "../../logger/logger";
import { sendMessage } from "../producer";

export async function sendVideoRemovedEvent(data: {
  videoId: string;
  userId: string;
}) {
  logger.info(
    "Sending video removed event to kafka topic: " + TOPICS.VIDEO_REMOVED_EVENT
  );
  const message = JSON.stringify(data);
  await sendMessage(TOPICS.VIDEO_REMOVED_EVENT, message);
}
