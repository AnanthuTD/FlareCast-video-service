import { WatchLaterEntity } from "@/domain/entities/WatchLater";

export interface WatchLaterParams {
	videoId: string;
	userId: string;
	workspaceId: string;
}

export interface IWatchLaterRepository {
	findByUserAndVideo(
		userId: string,
		videoId: string,
		workspaceId?: string | null
	): Promise<WatchLaterEntity | null>;

	add(params: WatchLaterParams): Promise<WatchLaterEntity>;
	findByUserIdAndWorkspaceId(
		userId: string,
		workspaceId: string
	): Promise<{videoIds: string[]} | null>;
	remove(params: WatchLaterParams): Promise<{videoIds: string[]}>;
}
