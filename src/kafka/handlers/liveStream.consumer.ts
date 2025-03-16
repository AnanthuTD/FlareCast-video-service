import { VideoStatus } from "@prisma/client";
import { logger } from "../../logger/logger";
import { VideoRepository } from "../../repository/video.repository";
import eventEmitter from "../../eventEmitter";
import EventName from "../../eventEmitter/eventNames";

export async function handleLiveStreamEvent(value: {
  videoId: string;
  status: VideoStatus;
}) {
  logger.info(
    `Live stream event received, status: ${
      value ? "🟢 success" : "🔴 failed"
    }`,
    value
  );

  if (value.status) {
    eventEmitter.emit(EventName.LIVE_STREAMING, {
			videoId: value.videoId,
			status: value.status,
		});
    await VideoRepository.updateLiveStreamStatus(value.videoId, value.status);
  }
}
