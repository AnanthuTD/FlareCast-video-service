export interface WatchLaterProps {
	id: string;
	workspaceId: string;
	userId: string;
	user?: { fullName?: string; image?: string | null };
	videoIds: string[];
}

export class WatchLaterEntity {
	private _id: string;
	private _userId: string;
	private _workspaceId: string;
	private _videoIds: string[];
	private _user?: { fullName?: string; image?: string | null };

	constructor(props: WatchLaterProps) {
		this._id = props.id;
		this._userId = props.userId;
		this._workspaceId = props.workspaceId;
		this._videoIds = props.videoIds;
		this._user = props.user;
		this.validate();
	}

	private validate(): void {
		if (!this._userId || !this._workspaceId) {
			throw new Error("User ID and Workspace ID are required");
		}
	}

	public addVideo(videoId: string): void {
		if (this._videoIds.includes(videoId)) {
			throw new Error("Video already in watch later list");
		}
		this._videoIds.push(videoId);
	}

	public removeVideo(videoId: string): void {
		const index = this._videoIds.indexOf(videoId);
		if (index === -1) {
			throw new Error("Video not in watch later list");
		}
		this._videoIds.splice(index, 1);
	}

	// Getters
	get id(): string {
		return this._id;
	}
	get userId(): string {
		return this._userId;
	}
	get workspaceId(): string {
		return this._workspaceId;
	}
	get videoIds(): string[] {
		return [...this._videoIds];
	}
	get user(): { fullName?: string; image?: string | null } | undefined {
		return this._user;
	}
}
