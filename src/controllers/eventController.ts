import { Request, Response } from "express";
import { logger } from "../logger/logger";
import { VideoRepository } from "../repository/video.repository";
import { VideoStatus } from "@prisma/client";

const userSockets = new Map<string, Response>();

export default function eventsController(req: Request, res: Response) {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.setHeader("X-Accel-Buffering", "no"); // 🔥 Critical for Nginx
	res.setHeader("Access-Control-Allow-Origin", "*"); // ✅ Add CORS if needed

	const userId = req.query.userId;
	const { workspaceId } = req.params;

	if (!userId) {
		res.sendStatus(400);
		return;
	}

	userSockets.set(`${userId}:${workspaceId}`, res);

	logger.debug(`✔️ User ${userId} connected to SSE`);

	// res.write(`data: ${JSON.stringify({ test: "hi" })}\n\n`);
	// res.flush(); // 🔥 Force immediate data delivery

	// Keep connection alive with heartbeat
	const keepAlive = setInterval(() => {
		res.write(":\n\n");
		res.flush(); // ✅ Ensure heartbeat is sent immediately
	}, 5000);

	req.on("close", () => {
		userSockets.delete(`${userId}:${workspaceId}`);
		clearInterval(keepAlive);
		res.end(); // 🔥 Properly close connection
		logger.debug(`✔️ User ${userId} disconnected from SSE`);
	});
}

export async function handleVideoStatusUpdateEvent(value: {
	videoId: string;
	status: VideoStatus;
	message: string;
	event: string;
}) {
	try {
		const video = await VideoRepository.getVideoById(value.videoId);
		if (!video) {
			logger.error(`🔴 Video ${value.videoId} not found`);
			return;
		}

		const userResponse = userSockets.get(
			`${video.userId}:${video.workspaceId}`
		);
		if (userResponse) {
			userResponse.write(
				`data: ${JSON.stringify({ ...value, type: video.type })}\n\n`
			);
			logger.info(`✅ Sent update to user ${video.userId}: ${value.message}`);
		} else {
			logger.warn(`⚠️ User ${video.userId} not connected to SSE`);
		}
	} catch (error) {
		logger.error(
			`🔴 Error sending SSE event to user for video: ${value.videoId}:`,
			error
		);
	}
}

export async function handleTestEvents(req, res) {
	logger.debug("==================== Testing events ====================");

	const key = "67a372a0be2e27143ea646b6:67a372a1f9ec9fea4a997014";
	logger.debug(`Checking for key: ${key} in userSockets`);

	if (!userSockets.has(key)) {
		logger.warn(`⚠️ No SSE connection found for key: ${key}`);
		return res.status(404).json({ error: "User not connected to SSE" });
	}

	const userResponse = userSockets.get(key);

	if (!userResponse) {
		logger.warn(`⚠️ User SSE response not found for key: ${key}`);
		return res.status(500).json({ error: "SSE connection error" });
	}

	logger.debug("================ Sending test events =================");

	const videoId = "dummy-video-id";
	const videoData = {
		id: videoId,
		duration: "10:30",
		userName: "John Doe",
		timeAgo: "Just now",
		title: "My First Video",
		views: 0,
		comments: 0,
		shares: 0,
		thumbnailUrl: "",
		userAvatarUrl: "",
		processing: true,
		transcodeStatus: false,
		uploaded: false,
		thumbnailStatus: false,
		transcriptionStatus: false,
		titleStatus: false,
		descriptionStatus: false,
	};

	// Function to send an event
	const sendEvent = (update, delay) => {
		setTimeout(() => {
			Object.assign(videoData, update);
			userResponse.write(`data: ${JSON.stringify(videoData)}\n\n`);
			res.flush();
			logger.info(`✅ Sent event update: ${JSON.stringify(update)}`);
		}, delay);
	};

	// Sequentially trigger events
	sendEvent({ uploaded: true }, 2000); // After 2s, mark video as uploaded
	sendEvent({ transcodeStatus: true }, 5000); // After 5s, transcoding done
	sendEvent({ thumbnailStatus: true }, 7000); // After 7s, thumbnail generated
	sendEvent({ transcriptionStatus: true }, 10000); // After 10s, transcription done
	sendEvent({ titleStatus: true }, 12000); // After 12s, title extracted
	sendEvent({ descriptionStatus: true }, 14000); // After 14s, description generated
	sendEvent({ processing: false }, 16000); // After 16s, processing complete

	res.sendStatus(200);
}
