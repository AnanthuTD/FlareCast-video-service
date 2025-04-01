import { RequestHandler } from "express";
import prisma from "../prismaClient";
import { logger } from "../logger/logger";
import axios from "axios";
import env from "../env";
import { AwsRepository } from "../repository/aws.repository";
import CircuitBreaker from "opossum";

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

	console.log(req.body);

	// Input validation
	if (!videoId) {
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

export const videoMoveController: RequestHandler = async (req, res) => {
	const { videoId } = req.params as { videoId: string };
	const userId = (req.user as User).id; // Cast req.user to User type
	const { folderId = "" } = req.body as VideoShareRequestBody;

	console.log(req.body);

	// Input validation
	if (!videoId) {
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

		if (video.folderId === folderId) {
			return res
				.status(400)
				.json({ message: "Video already shared in this space/folder" });
		}

		console.log("video : ", video);

		const destination = await checkPermission({
			userId,
			destination: { folderId, workspaceId: video.workspaceId },
			source: {
				folderId: video.folderId,
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

		await prisma.video.update({
			where: { id: videoId },
			data: {
				folderId,
			},
		});

		// Log successful sharing
		logger.info(`User ${userId} shared video ${videoId} to folder ${folderId}`);

		return res.status(201).json({ message: "Video shared successfully" });
	} catch (err) {
		logger.error(`Failed to share video ${videoId}: ${err.message}`);
		console.log(err);
		return res.status(500).json({ message: "Failed to share video" });
	}
};

// Define the Circuit Breaker outside the function for reuse
const permissionServiceBreaker = new CircuitBreaker(
	async ({ userId, source, destination }: PermissionCheckParams) => {
		const { data } = await axios.post<PermissionResponse>(
			`${env.COLLABORATION_API_URL}/permissions/share-file`,
			{
				userId,
				source,
				destination,
			},
			{ timeout: 2000 } // 2-second timeout per request
		);
		return data;
	},
	{
		timeout: 2000, // Timeout after 2 seconds
		errorThresholdPercentage: 50, // Trip if 50% of requests fail
		resetTimeout: 30000, // Retry after 30 seconds
	}
);

// Log state changes
permissionServiceBreaker.on("open", () =>
	logger.warn("Circuit opened for permission service")
);
permissionServiceBreaker.on("halfOpen", () =>
	logger.info("Circuit half-open for permission service")
);
permissionServiceBreaker.on("close", () =>
	logger.info("Circuit closed for permission service")
);

async function checkPermission({
	userId,
	source,
	destination,
}: PermissionCheckParams) {
	console.log(source, destination);

	const maxRetries = 3;
	let lastError: any;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const data = await permissionServiceBreaker.fire({
				userId,
				source,
				destination,
			});
			return data;
		} catch (error) {
			lastError = error;
			logger.warn(
				`Attempt ${
					attempt + 1
				} failed to check permission for user ${userId}, space ${
					source.spaceId
				}, folder ${source.folderId}: ${
					error instanceof Error ? error.message : error
				}`
			);

			// Don't delay on the last attempt
			if (attempt < maxRetries - 1) {
				await new Promise((resolve) =>
					setTimeout(resolve, 1000 * Math.pow(2, attempt))
				);
			}
		}
	}

	// All retries failed or circuit is open
	logger.error(
		`Failed to check permission for sharing video in space ${
			source.spaceId
		} and folder ${source.folderId} after ${maxRetries} attempts: ${
			lastError.response?.data?.message ||
			(lastError instanceof Error ? lastError.message : lastError)
		}`
	);
	return null;
}

export { checkPermission };
