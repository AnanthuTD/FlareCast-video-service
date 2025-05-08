import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "@/infra/logger";
import { Socket } from "socket.io";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import {
	IWorkspaceService,
	WorkspaceService,
} from "@/app/services/implementation/WorkspaceService";
import { SubscriptionRepository } from "../repository/prisma/subscription.repository";
import { EventService } from "@/app/services/implementation/EventService";
import { S3Service } from "@/app/services/implementation/S3Service";
import { KafkaEventConsumer } from "./KafkaEventConsumer";
import { TOPICS } from "../kafka/topics";

export class VideoProcessor {
	constructor(
		private subscriptionRepo: SubscriptionRepository,
		private videoRepo: IVideoRepository,
		private s3Service: S3Service,
		private eventService: EventService,
		private socket?: Socket
	) {}

	// step 1
	async handleProcessRequested(data: {
		userId: string;
		fileName: string;
		folderId: string;
		workspaceId: string;
		spaceId: string;
		socketId: string;
	}) {
		logger.info("Processing video requested");
		await this.eventService.publishVideoProcessRequestEvent(data);
	}

	// step 2
	async validateWorkspace(data: {
		userId: string;
		fileName: string;
		folderId: string;
		workspaceId: string;
		spaceId: string;
		socketId: string;
	}) {
		try {
			const eventConsumer = new KafkaEventConsumer();
			const workspaceService = new WorkspaceService();
			/* 	() => {
					eventConsumer.pause([{ topic: TOPICS.VIDEO_PROCESS_REQUEST_EVENT }]);
				},
				() => {
					eventConsumer.resume([{ topic: TOPICS.VIDEO_PROCESS_REQUEST_EVENT }]);
				} */

			const selectedData = await workspaceService.getSelectedWorkspace(data);

			await this.eventService.publishSelectedWorkspaceValidatedEvent({
				...data,
				workspaceId: selectedData.selectedWorkspace,
				folderId: selectedData.selectedFolder,
				spaceId: selectedData.selectedSpace,
			});
		} catch (error) {
			logger.error(`Workspace validation failed: ${error.message}`);
			await this.eventService.publishVideoProcessRequestEvent(data);
			throw error;
		}
	}

	// step 3
	async validateSubscription(data: {
		userId: string;
		fileName: string;
		workspaceId: string;
		folderId: string;
		spaceId: string;
		socketId: string;
	}) {
		logger.info("Validate Subscription");
		const limits = await this.subscriptionRepo.getLimits(data.userId);
		if (limits.permission !== "granted") {
			throw new Error("Subscription limits not granted");
		}
		await this.eventService.publishSubscriptionValidated({
			...data,
			subscriptionLimits: limits,
		});
	}

	// step 4
	async createVideo(data: {
		userId: string;
		fileName: string;
		workspaceId: string;
		folderId: string;
		spaceId: string;
		subscriptionLimits: any;
		socketId: string;
	}) {
		const newVideo = await this.videoRepo.create({
			userId: data.userId,
			workspaceId: data.workspaceId,
			folderId: data.folderId,
			spaceId: data.spaceId,
		});
		await this.eventService.publishVideoCreatedEvent({
			...data,
			videoId: newVideo.id,
		});
	}

	// step 5
	async uploadToS3(data: {
		fileName: string;
		videoId: string;
		subscriptionLimits: any;
		socketId: string;
	}) {
		try {
			const inputVideo = path.join(process.cwd(), "temp_upload", data.fileName);
			const s3Key = `${data.videoId}/original.${data.fileName
				.split(".")
				.pop()}`;
			await this.s3Service.uploadFileToS3(inputVideo, s3Key);
			await this.eventService.sendVideoUploadEvent({
				...data,
				s3Key,
			});
			this.cleanupAndNotify({
				...data,
			});
		} catch (err) {
			logger.error("🔴 error while uploading to s3!");
			console.error(err);
		}
	}

	// step 6
	async cleanupAndNotify(data: {
		fileName: string;
		videoId: string;
		socketId: string;
	}) {
		const inputVideo = path.join(process.cwd(), "temp_upload", data.fileName);
		await fs
			.unlink(inputVideo)
			.catch((err) =>
				logger.warn(`Failed to delete temp file ${inputVideo}:`, err)
			);
		this.socket
			?.to(data.socketId)
			.emit("process:video:success", { videoId: data.videoId });
	}

	async handleError(error: Error, socketId: string) {
		logger.error(`Error in video processing: ${error.message}`);
		this.socket
			?.to(socketId)
			.emit("process:video:error", { message: error.message });
	}
}
