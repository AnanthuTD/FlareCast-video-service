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
	source: { workspaceId: string; spaceId?: string; folderId?: string };
	destination: { workspaceId: string; spaceId?: string; folderId?: string };
}

interface PermissionResponse {
	permission: "granted" | "denied";
	folderId: string | null;
	spaceId: string | null;
	workspaceId: string | null;
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

		console.log("video : ", video);

		const destination = await checkPermission({
			userId,
			destination: { folderId, spaceId, workspaceId: video.workspaceId },
			source: {
				folderId: video.folderId,
				spaceId: video.spaceId,
				workspaceId: video.workspaceId,
			},
		});

		console.log("destination: ", destination);
		console.log("sources: ", {
			folderId: video.folderId,
			spaceId: video.spaceId,
			workspaceId: video.workspaceId,
		});

		if (destination?.permission !== "granted") {
			return res.status(403).json({
				message: "User does not have permission to share in this space/folder",
			});
		}

		// Create a new video record for the shared space/folder
		const newVideo = await prisma.video.create({
			data: {
				...{ ...video, id: undefined },
				spaceId: destination.spaceId || undefined,
				folderId: destination.folderId || undefined,
			},
			select: {
				id: true,
			},
		});

		console.log(newVideo);

		AwsRepository.copyVideo(videoId, newVideo.id)
			.then(() => {
				logger.info("Copied video s3");
			})
			.catch((err) => {
				logger.error("Failed to copy video s3");
				console.log(err);
			});

		// Log successful sharing
		logger.info(
			`User ${userId} shared video ${videoId} in space ${spaceId} and folder ${folderId}`
		);

		return res.status(201).json({ message: "Video shared successfully" });
	} catch (err) {
		logger.error(`Failed to share video ${videoId}: ${err.message}`);
		console.log(err);
		return res.status(500).json({ message: "Failed to share video" });
	}
};

async function checkPermission({
	userId,
	source,
	destination,
}: PermissionCheckParams) {
	console.log(source, destination);
	try {
		const { data } = await axios.post<PermissionResponse>(
			`${env.COLLABORATION_API_URL}/permissions/share-file`,
			{
				userId,
				source,
				destination,
			}
		);

		return data;
	} catch (error) {
		logger.error(
			`Failed to check permission for sharing video in space ${source.spaceId} and folder ${source.folderId}: ${error.response?.data?.message}`
		);
		return null;
	}
}
