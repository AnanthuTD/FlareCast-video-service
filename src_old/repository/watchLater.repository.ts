import prisma from "../prismaClient";

export class WatchLaterRepository {
	static async add({
		userId,
		videoId,
		workspaceId,
	}: {
		videoId: string;
		userId: string;
		workspaceId: string;
	}) {
		// Input validation
		if (!userId || !workspaceId || !videoId) {
			throw new Error(
				"Missing required parameters: userId, workspaceId, and videoId are all required"
			);
		}

		try {
			let watchLater = await prisma.watchLater.findFirst({
				where: { userId, workspaceId },
				select: { videoIds: true, id: true },
			});

			if (!watchLater) {
				// Create new watch later entry if it doesn't exist
				watchLater = await prisma.watchLater.create({
					data: {
						userId,
						workspaceId,
						videoIds: [videoId],
					},
				});
			} else if (!watchLater.videoIds.includes(videoId)) {
				// Update existing entry if videoId isn't already present
				await prisma.watchLater.update({
					where: {
						userId_workspaceId: { userId, workspaceId },
					},
					data: {
						videoIds: {
							push: videoId,
						},
					},
					select: { id: true },
				});
			}
			// If videoId already exists, do nothing (silent success)
			return { id: watchLater.id };
		} catch (error) {
			throw new Error(`Failed to add video to watch later: ${error.message}`);
		}
	}

	static async get({
		userId,
		workspaceId,
		limit = 10,
		skip = 0,
	}: {
		userId: string;
		workspaceId: string;
		limit: number;
		skip: number;
	}) {
		if (!userId || !workspaceId) {
			throw new Error(
				"Missing required parameters: userId and workspaceId are required"
			);
		}

		try {
			const watchLater = await prisma.watchLater.findFirst({
				where: { userId, workspaceId },
				select: { videoIds: true, videos: true },
				take: limit,
				skip,
			});

			return watchLater?.videoIds || [];
		} catch (error) {
			throw new Error(`Failed to get watch later videos: ${error.message}`);
		}
	}

	static async getTotalVideos({
		userId,
		workspaceId,
	}: {
		userId: string;
		workspaceId: string;
	}) {
		try {
			const videos = await prisma.watchLater.findFirst({
				where: {
					userId,
					workspaceId,
				},
				select: {
					videoIds: true,
				},
			});

			return videos?.videoIds.length ?? 0;
		} catch (error) {
			return 0;
		}
	}

	static async remove({
		userId,
		videoId,
		workspaceId,
	}: {
		videoId: string;
		userId: string;
		workspaceId: string;
	}) {
		if (!userId || !workspaceId || !videoId) {
			throw new Error(
				"Missing required parameters: userId, workspaceId, and videoId are required"
			);
		}

		try {
			const watchLater = await prisma.watchLater.findFirst({
				where: { userId, workspaceId },
				select: { videoIds: true },
			});

			if (watchLater && watchLater.videoIds.includes(videoId)) {
				await prisma.watchLater.update({
					where: {
						userId_workspaceId: { userId, workspaceId },
					},
					data: {
						videoIds: watchLater.videoIds.filter((id) => id !== videoId),
					},
				});
			}
			return { watchLater: null };
		} catch (error) {
			throw new Error(
				`Failed to remove video from watch later: ${error.message}`
			);
		}
	}
}
