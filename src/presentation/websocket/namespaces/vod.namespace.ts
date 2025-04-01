// src/infra/websocket/vodNamespace.ts
import { Namespace, Socket } from "socket.io";
import fs from "node:fs/promises";
import path from "node:path";
import { authenticateWebsocketUser } from "../middleware/socketAuth.middleware";
import { logger } from "@/infra/logger";
import { SubscriptionRepository } from "@/infra/repository/prisma/subscription.repository";
import { WorkspaceService } from "@/app/services/implementation/WorkspaceService";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { S3Service } from "@/app/services/implementation/S3Service";
import { EventService } from "@/app/services/implementation/EventService";
import { KafkaEventPublisher } from "@/infra/providers/KafkaEventPublisher";
import { VideoProcessor } from "@/infra/providers/VideoProcessor";

export const setupVodNamespace = (namespace: Namespace) => {
	namespace.use(authenticateWebsocketUser);

	namespace.on("connection", (socket: Socket) => {
		logger.info(`🟢 Socket connected: ${socket.id}`);

		const processor = new VideoProcessor(
			new SubscriptionRepository(),
			new VideoRepository(),
			new S3Service(),
			new EventService(new KafkaEventPublisher()),
			socket
		);

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
					if (callback) callback({ success: true });
				} catch (err) {
					logger.error("Error writing chunk:", err);
					if (callback)
						callback({ success: false, error: (err as Error).message });
				}
			}
		);

		socket.on(
			"process:video",
			async (
				data: {
					userId: string;
					fileName: string;
					preset: { folderId: string; workspaceId: string; spaceId: string };
				},
				callback?: (response: {
					success: boolean;
					videoId?: string;
					error?: string;
				}) => void
			) => {
				try {
					await processor.handleProcessRequested({
						...data,
						socketId: socket.id,
						...data.preset,
					});
					if (callback) callback({ success: true });
				} catch (error) {
					logger.error(`Error initiating process: ${error.message}`);
					if (callback) callback({ success: false, error: error.message });
				}
			}
		);
	});
};
