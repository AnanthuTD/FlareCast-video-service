import { Namespace, Socket } from "socket.io";
import { logger } from "../logger/logger";
import { SubscriptionRepository } from "../repository/subscription.repository";
import { WorkspaceService } from "../services/workspace.service";
import { VideoRepository } from "../repository/video.repository";
import path from "node:path";
import { uploadFileToS3 } from "../aws/uploadToS3";
import { sendVideoUploadEvent } from "../kafka/handlers/videoUploadEvent.producer";
import fs from "node:fs/promises";
import { authenticateWebsocketUser } from "../middleware/socketAuth.middleware";

export const setupVodNamespace = (namespace: Namespace) => {
	namespace.use(authenticateWebsocketUser);

	namespace.on("connection", (socket: Socket) => {
		logger.info(`🟢 Socket connected: ${socket.id}`);

		socket.on("disconnect", () => {
			logger.info(`🔴 Socket disconnected: ${socket.id}`);
		});

		socket.on(
			"video:chunks",
			async (
				data: { fileName: string; chunks: Buffer },
				callback?: (response: { success: boolean; error?: string }) => void
			) => {
				try {
					logger.info(`🟣 Video chunk received for ${data.fileName}`);
					const uploadDir = path.join(process.cwd(), "temp_upload");
					await fs.mkdir(uploadDir, { recursive: true });
					const filePath = path.join(uploadDir, data.fileName);

					await fs.appendFile(filePath, data.chunks);
					logger.info("Chunk written successfully!");

					if (callback) {
						callback({ success: true });
					}
				} catch (err) {
					logger.error("Error writing chunk to file:", err);
					if (callback) {
						callback({ success: false, error: (err as Error).message });
					}
				}
			}
		);

		socket.on(
			"process:video",
			async (
				data: {
					userId: string;
					fileName: string;
					preset: {
						folderId: string;
						workspaceId: string;
						spaceId: string;
					};
				},
				callback?: (response: {
					success: boolean;
					videoId?: string;
					error?: string;
				}) => void
			) => {
				logger.info("⚙️ Processing video...");
				console.log("preset: ", data.preset)
				try {
					const subscriptionLimits = await SubscriptionRepository.getLimits(
						data.userId
					);
					if (subscriptionLimits.permission !== "granted") {
						socket.emit("process:video:error", {
							message: "Subscription limits not granted",
						});
						if (callback) {
							callback({
								success: false,
								error: "Subscription limits not granted",
							});
						}
						return;
					}

					const selectedData = await WorkspaceService.getSelectedWorkspace(
						data.userId,
						data.preset?.workspaceId,
						data.preset?.folderId,
						data.preset?.spaceId
					);

					const newVideo = await VideoRepository.createVideo(
						data.userId,
						 selectedData.selectedWorkspace,
						 selectedData.selectedFolder,
             selectedData.selectedSpace,
					);

					const inputVideo = path.join(
						process.cwd(),
						"temp_upload",
						data.fileName
					);
					const s3Key = `${newVideo.id}/original.${data.fileName
						.split(".")
						.pop()}`;

					await uploadFileToS3(inputVideo, s3Key);

					await sendVideoUploadEvent({
						s3Key,
						videoId: newVideo.id,
						userId: data.userId,
						aiFeature: subscriptionLimits.aiFeature,
					});

					await fs
						.unlink(inputVideo)
						.catch((err) =>
							logger.warn(`Failed to delete temp file ${inputVideo}:`, err)
						);

					logger.info("✅ Video processing completed successfully!");
					socket.emit("process:video:success", { videoId: newVideo.id });
					if (callback) {
						callback({ success: true, videoId: newVideo.id });
					}
				} catch (error) {
					logger.error(
						`🔴 Error processing video: ${(error as Error).message}`
					);
					socket.emit("process:video:error", {
						message: (error as Error).message,
					});
					if (callback) {
						callback({ success: false, error: (error as Error).message });
					}
				}
			}
		);
	});
};
