import { Request, Response } from "express";
import { VideoStatus } from "@prisma/client";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { logger } from "@/infra/logger";
import { SSEService } from "@/app/services/implementation/SSEService";

const sseService = new SSEService();

export default function eventsController(req: Request, res: Response) {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.setHeader("X-Accel-Buffering", "no");
	res.setHeader("Access-Control-Allow-Origin", "*");

	const userId = req.user.id;
	const { workspaceId } = req.params;
	const { spaceId } = req.query;

	if (!userId) {
		res.sendStatus(400);
		return;
	}

	sseService.registerConnection({
		userId,
		workspaceId,
		spaceId,
		response: res,
	});

	logger.debug(`✔️ User ${userId} connected to SSE`);

	// Keep connection alive with heartbeat
	const keepAlive = setInterval(() => {
		res.write(":\n\n");
		res.flush();
	}, 5000);

	req.on("close", () => {
		sseService.removeConnection(userId, workspaceId, spaceId);
		clearInterval(keepAlive);
		res.end();
		logger.debug(`✔️ User ${userId} disconnected from SSE`);
	});
}

export async function sendVideoStatusUpdate(value: {
	videoId: string;
	status: VideoStatus;
	message: string;
	event: string;
}) {
	try {
		logger.debug("sendVideoStatusUpdate triggered!");

		const videoRepo = new VideoRepository();

		sseService.sendVideoStatusUpdate(videoRepo, value);
	} catch (error) {
		logger.error(
			`🔴 Error sending SSE event to user for video: ${value.videoId}:`,
			error
		);
	}
}

/* export async function handleTestEvents(req, res) {
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
 */
