import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class VideoRepository {
	static async createVideo(
		userId: string,
		workspaceId: string,
		folderId: string
	) {
		return await prisma.video.create({
			data: {
				userId,
				workspaceId,
				folderId,
			},
		});
	}

	static async updateProcessingStatus(videoId: string, status: boolean) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { processing: status },
		});
	}

	static async updateTitleAndDescription(
		videoId: string,
		title: string,
		description: string
	) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { title, description },
		});
	}

	static async updateTranscription(videoId: string, transcription: string) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { transcription },
		});
	}

	static async getVideoById(videoId: string) {
		return await prisma.video.findUnique({
			where: { id: videoId },
		});
	}

	static async updateTranscodeStatus(videoId: string, status: boolean) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { transcodeStatus: status },
		});
	}

	static async updateThumbnailStatus(videoId: string, status: boolean) {
		return await prisma.video.update({
			where: { id: videoId },
			data: { thumbnailStatus: status },
		});
	}
}
