import { Namespace, Socket } from "socket.io";
import { logger } from "../logger/logger";
import { SubscriptionRepository } from "../repository/subscription.repository";
import { WorkspaceService } from "../services/workspace.service";
import { VideoRepository } from "../repository/video.repository";
import path from "node:path";
import { uploadFileToS3 } from "../aws/uploadToS3";
import { sendVideoUploadEvent } from "../kafka/handlers/videoUploadEvent.producer";
import fs from "node:fs";
import { authenticateWebsocketUser } from "../middleware/socketAuth.middleware";

export const setupVodNamespace = (namespace: Namespace) => {
	namespace.use(authenticateWebsocketUser);

  namespace.on("connection", (socket: Socket) => {
    logger.info(`🟢 Socket connected: ${socket.id}`);
  })

	namespace.on("disconnect", (socket: Socket) => {
		logger.info(`🔴 Socket disconnected: ${socket.id}`);
	});

	namespace.on("video:chunks", (data: { fileName: string; chunks: Buffer }) => {
		logger.info(`🟣 Video chunk received for ${data.fileName}`);

		// Ensure the upload directory exists
		const uploadDir = path.join("temp_upload");
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}

		const writeStream = fs.createWriteStream(path.join(uploadDir, data.fileName), {
			flags: "a",
		});

		writeStream.write(data.chunks, (err) => {
			if (err) {
				logger.error("Error writing chunk to file:", err);
			} else {
				logger.info("Chunk written successfully!");
			}
		});
	});

	namespace.on(
		"process:video",
		async (data: {
			userId: string;
			fileName: string;
			folderId: string;
			workspaceId: string;
		}) => {
			logger.info("⚙️ Processing video...");

			try {
				const subscriptionLimits = await SubscriptionRepository.getLimits(
					"67a372a0be2e27143ea646b6"
				);

				if (subscriptionLimits.permission !== "granted") {
					return;
				}

				// Retrieve workspace
				const workspaceId = await WorkspaceService.getSelectedWorkspace(
					data.userId,
					data.workspaceId,
					data.folderId
				);

				// Create video entry in DB
				const newVideo = await VideoRepository.createVideo(
					data.userId,
					workspaceId,
					data.folderId
				);

				const inputVideo = path.join(
					process.cwd(),
					"temp_upload",
					data.fileName
				);

				const s3Key = `${newVideo.id}/original.${data.fileName
					.split(".")
					.at(-1)}`;

				await uploadFileToS3(inputVideo, s3Key);

				// send event to kafka
				await sendVideoUploadEvent({
					s3Key,
					videoId: newVideo.id,
					userId: data.userId,
					aiFeature: subscriptionLimits.aiFeature,
				});

				logger.info("✅ Video processing completed successfully!");
			} catch (error) {
				logger.error(`🔴 Error processing video: ${(error as Error).message}`);
			}
		}
	);
};
