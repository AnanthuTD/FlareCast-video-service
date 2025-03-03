import { RequestHandler } from "express";
import prisma from "../prismaClient";
import { logger } from "../logger/logger";
import axios from "axios";
import env from "../env";
import { AwsRepository } from "../repository/aws.repository";

interface Video {
	id: string;
	spaceId?: string;
	folderId?: string;
	workspaceId: string;
	title?: string;
	url?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

interface PermissionCheckParams {
	userId: string;
	workspaceId: string;
	spaceId: string;
	folderId: string;
}

interface PermissionResponse {
	permission: "granted" | "denied";
}

interface VideoShareRequestBody {
	spaceId?: string;
	folderId?: string;
}

interface User {
	id: string;
	email?: string;
	name?: string;
}

export const videoShareController: RequestHandler = async (req, res) => {
	const { videoId } = req.params as { videoId: string };
	const userId = (req.user as User).id; // Cast req.user to User type
	const { spaceId = "", folderId = "" } = req.body as VideoShareRequestBody;

	// Input validation
	if (!videoId || !spaceId) {
		return res
			.status(400)
			.json({ message: "Video ID and Space ID are required" });
	}

	try {
		// Check if the video exists in the database
		const video = (await prisma.video.findUnique({
			where: { id: videoId },
		})) as Video | null;

		if (!video) {
			return res.status(404).json({ message: "Video not found" });
		}

		if (video.spaceId === spaceId && video.folderId === folderId) {
			return res
				.status(400)
				.json({ message: "Video already shared in this space/folder" });
		}

		if (
			!(await checkPermission({
				folderId,
				spaceId,
				userId,
				workspaceId: video.workspaceId,
			}))
		) {
			return res.status(403).json({
				message: "User does not have permission to share in this space/folder",
			});
		}

		// Create a new video record for the shared space/folder
		const newVideo = await prisma.video.create({
			data: {
				...{ ...video, id: undefined },
				spaceId: spaceId || undefined,
				folderId: folderId || undefined,
			},
			select: {
				id: true,
			},
		});

		await AwsRepository.copyVideo(videoId, newVideo.id);

		// Log successful sharing
		logger.info(
			`User ${userId} shared video ${videoId} in space ${spaceId} and folder ${folderId}`
		);

		return res.status(201).json({ message: "Video shared successfully" });
	} catch (err) {
		logger.error(`Failed to share video ${videoId}: ${err.message}`);
		return res.status(500).json({ message: "Failed to share video" });
	}
};

async function checkPermission({
	userId,
	folderId,
	spaceId,
	workspaceId,
}: PermissionCheckParams): Promise<boolean> {
	try {
		const { data } = await axios.post<PermissionResponse>(
			`${env.COLLABORATION_API_URL}/permissions/share-file`,
			{
				userId,
				source: {
					workspaceId,
					spaceId,
					folderId,
				},
				destination: {
					spaceId,
					folderId,
				},
			}
		);

		return data.permission === "granted";
	} catch (error) {
		logger.error(
			`Failed to check permission for sharing video in space ${spaceId} and folder ${folderId}: ${error.response?.data?.message}`
		);
		return false;
	}
}
