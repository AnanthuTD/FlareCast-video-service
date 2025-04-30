import {
	IWatchLaterRepository,
	WatchLaterParams,
} from "@/app/repository/IWatchLaterRepository";
import { WatchLaterEntity } from "@/domain/entities/WatchLater";
import prisma from "@/infra/databases/prisma/connection";

export class WatchLaterRepository implements IWatchLaterRepository {
	async findByUserAndVideo(
		userId: string,
		videoId: string,
		workspaceId?: string | null
	): Promise<WatchLaterEntity | null> {
		const watchLater = await prisma.watchLater.findFirst({
			where: {
				userId,
				...(workspaceId ? { workspaceId } : {}),
				videoIds: { has: videoId },
			},
			// select: { id: true },
		});
		return watchLater ? new WatchLaterEntity(watchLater) : null;
	}

	async add({
		videoId,
		userId,
		workspaceId,
	}: WatchLaterParams): Promise<WatchLaterEntity> {
		const watchLater = await prisma.watchLater.upsert({
			where: { userId_workspaceId: { userId, workspaceId } },
			update: { videoIds: { push: videoId } },
			create: { userId, workspaceId, videoIds: [videoId] },
		});
		return { videoIds: watchLater.videoIds };
	}

	async findByUserIdAndWorkspaceId(
		userId: string,
		workspaceId: string
	): Promise<{ videoIds: string[] } | null> {
		const watchLater = await prisma.watchLater.findFirst({
			where: { userId, workspaceId },
			select: { videoIds: true },
		});
		return watchLater ? { videoIds: watchLater.videoIds } : null;
	}

	async remove({
		videoId,
		userId,
		workspaceId,
	}: WatchLaterParams): Promise<{ videoIds: string[] }> {
		const watchLater = await prisma.watchLater.update({
			where: { userId_workspaceId: { userId, workspaceId } },
			data: {
				videoIds: {
					set:
						(
							await this.findByUserIdAndWorkspaceId(userId, workspaceId)
						)?.videoIds.filter((id) => id !== videoId) || [],
				},
			},
		});
		return { videoIds: watchLater.videoIds };
	}
}
