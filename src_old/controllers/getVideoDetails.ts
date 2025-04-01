import { Request, Response } from "express";
import prisma from "../prismaClient";
import { AuthenticatedRequest } from "../types/types";
import env from "../env";
import axios from "axios";
import { logger } from "../logger/logger";
import CircuitBreaker from "opossum";

const collaborationServiceBreaker = new CircuitBreaker(
	async (spaceId: string, userId: string) => {
		const { data } = await axios.get(
			`${env.COLLABORATION_API_URL}/permissions/${spaceId}/space/${userId}/isMember`,
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
collaborationServiceBreaker.on("open", () =>
	logger.warn("Circuit opened for collaboration service")
);
collaborationServiceBreaker.on("halfOpen", () =>
	logger.info("Circuit half-open for collaboration service")
);
collaborationServiceBreaker.on("close", () =>
	logger.info("Circuit closed for collaboration service")
);

export async function getVideoDetails(req: Request, res: Response) {
	try {
		const { id } = (req as AuthenticatedRequest).user;
		const { videoId } = req.params;

		const video = await prisma.video.findFirst({
			where: {
				id: videoId,
				// userId: id,
			},
		});

		if (!video) {
			res.status(404).json({ message: "Video not found", video: null });
			return;
		}

		if (!video.isPublic && video.userId !== id) {
			if (!video.spaceId) {
				logger.debug("Video is not public and user is not the owner");
				res
					.status(403)
					.json({ message: "User don't have access rights to this video" });
				return;
			}

			// Use Circuit Breaker with retries
			const maxRetries = 3;
			let lastError: any;

			for (let attempt = 0; attempt < maxRetries; attempt++) {
				try {
					const data = await collaborationServiceBreaker.fire(
						video.spaceId,
						id
					);

					if (!data.isMember) {
						logger.debug(
							"User is not a member of the space and has permission"
						);
						res
							.status(403)
							.json({ message: "User don't have access rights to this video" });
						return;
					}
					break; // Success, exit retry loop
				} catch (err) {
					lastError = err;
					logger.warn(
						`Attempt ${
							attempt + 1
						} failed checking permission for user ${id} in space ${
							video.spaceId
						}: ${err instanceof Error ? err.message : err}`
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
			if (lastError) {
				logger.error(
					`Failed to check user permission after ${maxRetries} attempts: ${
						lastError instanceof Error ? lastError.message : lastError
					}`
				);
				res.status(500).json({ message: "Failed to check user permission" });
				return;
			}
		}

		const watchLater = await prisma.watchLater.findFirst({
			where: {
				userId: id,
				workspaceId: video.workspaceId ?? undefined,
				videoIds: { has: videoId },
			},
			select: { id: true },
		});

		res.json({ video: { ...video, watchLater } });
	} catch (error) {
		console.error(error);
	}
}

export async function getPreviewVideoDetails(req: Request, res: Response) {
	const { videoId } = req.params;
	// const userId = (req as AuthenticatedRequest).user.id;

	const video = await prisma.video.findFirst({
		where: {
			id: videoId,
		},
	});

	if (!video) {
		res.status(404).json({ message: "Video not found", video: null });
		return;
	}

	/* if (!video.isPublic && video.userId !== userId) {
		if (!video.spaceId) {
			logger.debug("Video is not public and user is not the owner");
			res
				.status(403)
				.json({ message: "User don't have access rights to this video" });
			return;
		}
		try {
			const { data } = await axios.get(
				`${env.COLLABORATION_API_URL}/permissions/${video.spaceId}/space/${userId}/isMember`
			);

			if (!data.isMember) {
				logger.debug("User is not a member of the space and has permission");
				res
					.status(403)
					.json({ message: "User don't have access rights to this video" });
			}
		} catch (err) {
			logger.error(`Error checking user permission: ${err?.response?.message}`);
			console.log(err);
			res.status(500).json({ message: "Failed to check user permission" });
			return;
		}
	} */

	res.json({ video: { ...video } });
}
