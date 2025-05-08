export interface IVideoEntity {
	id: string;
	title: string;
	description: string;
	createdAt: Date;
	userId: string;
	totalViews: number;
	uniqueViews: number;
	transcription: string;
	duration: string;
	folderId: string;
	workspaceId: string;
	spaceId: string;
	category: VideoCategory;
	type: VideoType;
	liveStreamStatus: VideoStatus;
	processing: boolean;
	transcodeStatus: VideoStatus;
	uploaded: VideoStatus;
	thumbnailStatus: VideoStatus;
	transcriptionStatus: VideoStatus;
	titleStatus: VideoStatus;
	descriptionStatus: VideoStatus;
	isPublic: boolean;
	user?: UserProps | null;
}

export enum VideoCategory {
	PROMOTIONAL = "PROMOTIONAL",
	DEFAULT = "DEFAULT",
	GET_STARTED = "GET_STARTED",
}

export enum VideoStatus {
	SUCCESS = "SUCCESS",
	FAILED = "FAILED",
	PENDING = "PENDING",
	PROCESSING = "PROCESSING",
}

export enum VideoType {
	LIVE = "LIVE",
	VOD = "VOD",
}

export interface UserProps {
	id: string;
	fullName: string;
	image: string | null;
}

export class VideoEntity {
	private _id: string;
	private _title: string;
	private _description: string;
	private _createdAt: Date;
	private _userId?: string;
	private _totalViews: number;
	private _uniqueViews: number;
	private _transcription: string;
	private _duration: string;
	private _folderId: string;
	private _workspaceId: string;
	private _spaceId: string;
	private _category: VideoCategory;
	private _type: VideoType;
	private _liveStreamStatus: VideoStatus;
	private _processing: boolean;
	private _transcodeStatus: VideoStatus;
	private _uploaded: VideoStatus;
	private _thumbnailStatus: VideoStatus;
	private _transcriptionStatus: VideoStatus;
	private _titleStatus: VideoStatus;
	private _descriptionStatus: VideoStatus;
	private _isPublic: boolean;
	private _user: UserProps | null;

	constructor(props: IVideoEntity) {
		this._id = props.id;
		this._title = props.title;
		this._description = props.description;
		this._createdAt = props.createdAt;
		this._userId = props.userId;
		this._totalViews = props.totalViews;
		this._uniqueViews = props.uniqueViews;
		this._transcription = props.transcription;
		this._duration = props.duration;
		this._folderId = props.folderId;
		this._workspaceId = props.workspaceId;
		this._spaceId = props.spaceId;
		this._category = props.category;
		this._type = props.type;
		this._liveStreamStatus = props.liveStreamStatus;
		this._processing = props.processing;
		this._transcodeStatus = props.transcodeStatus;
		this._uploaded = props.uploaded;
		this._thumbnailStatus = props.thumbnailStatus;
		this._transcriptionStatus = props.transcriptionStatus;
		this._titleStatus = props.titleStatus;
		this._descriptionStatus = props.descriptionStatus;
		this._isPublic = props.isPublic;
		this._user = props.user ?? null;

		this.validate();
	}

	// Factory method for creating a new video
	static create(props: Partial<IVideoEntity>): VideoEntity {
		const defaultProps: IVideoEntity = {
			id: props.id ?? crypto.randomUUID(),
			title: props.title ?? "",
			description: props.description ?? "",
			createdAt: props.createdAt ?? new Date(),
			userId: props.userId ?? "",
			totalViews: props.totalViews ?? 0,
			uniqueViews: props.uniqueViews ?? 0,
			transcription: props.transcription ?? "",
			duration: props.duration ?? "0",
			folderId: props.folderId ?? "",
			workspaceId: props.workspaceId ?? "",
			spaceId: props.spaceId ?? "",
			category: props.category ?? VideoCategory.DEFAULT,
			type: props.type ?? VideoType.VOD,
			liveStreamStatus: props.liveStreamStatus ?? VideoStatus.PENDING,
			processing: props.processing ?? false,
			transcodeStatus: props.transcodeStatus ?? VideoStatus.PENDING,
			uploaded: props.uploaded ?? VideoStatus.PENDING,
			thumbnailStatus: props.thumbnailStatus ?? VideoStatus.PENDING,
			transcriptionStatus: props.transcriptionStatus ?? VideoStatus.PENDING,
			titleStatus: props.titleStatus ?? VideoStatus.PENDING,
			descriptionStatus: props.descriptionStatus ?? VideoStatus.PENDING,
			isPublic: props.isPublic ?? false,
		};
		return new VideoEntity(defaultProps);
	}

	// Validation logic
	private validate(): void {
		if (!this._id) {
			throw new Error("Video must have an ID");
		}
		// if (!this._userId) {
		// throw new Error("Video must be associated with a user");
		// this._userId = "Admin";
		// }
		if (this._totalViews < 0 || this._uniqueViews < 0) {
			throw new Error("View counts cannot be negative");
		}
		if (
			this._type === VideoType.LIVE &&
			this._liveStreamStatus === VideoStatus.FAILED
		) {
			throw new Error(
				"Live video cannot have a failed live stream status upon creation"
			);
		}
	}

	// Business methods
	public makePublic(): void {
		/* if (this._processing) {
			throw new Error("Cannot make video public while processing");
		}
		if (this._transcodeStatus !== VideoStatus.SUCCESS) {
			throw new Error("Video must be successfully transcoded to be public");
		} */
		this._isPublic = true;
	}

	public updateStatus(status: VideoStatus, key: StatusKey): void {
		switch (key) {
			case "liveStreamStatus":
				this._liveStreamStatus = status;
				break;
			case "transcodeStatus":
				this._transcodeStatus = status;
				break;
			case "uploaded":
				this._uploaded = status;
				break;
			case "thumbnailStatus":
				this._thumbnailStatus = status;
				break;
			case "transcriptionStatus":
				this._transcriptionStatus = status;
				break;
			case "titleStatus":
				this._titleStatus = status;
				break;
			case "descriptionStatus":
				this._descriptionStatus = status;
				break;
			default:
				throw new Error(`Cannot update status for key: ${key}`);
		}
		this._processing = this.isProcessing();
	}

	public incrementViews(unique: boolean = false): void {
		this._totalViews += 1;
		if (unique) {
			this._uniqueViews += 1;
		}
	}

	private isProcessing(): boolean {
		return [
			this._transcodeStatus,
			this._uploaded,
			this._thumbnailStatus,
			this._transcriptionStatus,
			this._titleStatus,
			this._descriptionStatus,
		].some(
			(status) =>
				status === VideoStatus.PROCESSING || status === VideoStatus.PENDING
		);
	}

	// Getters
	public get id(): string {
		return this._id;
	}

	public get title(): string {
		return this._title;
	}

	public get description(): string {
		return this._description;
	}

	public get createdAt(): Date {
		return this._createdAt;
	}

	public get userId(): string {
		return this._userId;
	}

	public get totalViews(): number {
		return this._totalViews;
	}

	public get uniqueViews(): number {
		return this._uniqueViews;
	}

	public get transcription(): string {
		return this._transcription;
	}

	public get duration(): string {
		return this._duration;
	}

	public get folderId(): string {
		return this._folderId;
	}

	public get workspaceId(): string {
		return this._workspaceId;
	}

	public get spaceId(): string {
		return this._spaceId;
	}

	public get category(): VideoCategory {
		return this._category;
	}

	public get type(): VideoType {
		return this._type;
	}

	public get liveStreamStatus(): VideoStatus {
		return this._liveStreamStatus;
	}

	public get processing(): boolean {
		return this._processing;
	}

	public get transcodeStatus(): VideoStatus {
		return this._transcodeStatus;
	}

	public get uploaded(): VideoStatus {
		return this._uploaded;
	}

	public get thumbnailStatus(): VideoStatus {
		return this._thumbnailStatus;
	}

	public get transcriptionStatus(): VideoStatus {
		return this._transcriptionStatus;
	}

	public get titleStatus(): VideoStatus {
		return this._titleStatus;
	}

	public get descriptionStatus(): VideoStatus {
		return this._descriptionStatus;
	}

	public get isPublic(): boolean {
		return this._isPublic;
	}

	get user(): UserProps | null {
		return this._user;
	}

	// Setters
	public set title(value: string) {
		if (value.trim() === "") {
			throw new Error("Title cannot be empty");
		}
		this._title = value;
		this._titleStatus = VideoStatus.SUCCESS;
	}

	public set description(value: string) {
		this._description = value;
		this._descriptionStatus = VideoStatus.SUCCESS;
	}

	public set transcription(value: string) {
		this._transcription = value;
		this._transcriptionStatus = VideoStatus.SUCCESS;
	}

	public set duration(value: string) {
		if (!value.match(/^\d+$/) && value !== "0") {
			// Basic validation, could be stricter
			throw new Error(
				"Duration must be a valid string representation of seconds"
			);
		}
		this._duration = value;
	}

	public set folderId(value: string) {
		if (!value) {
			throw new Error("Folder ID cannot be empty");
		}
		this._folderId = value;
	}

	public set workspaceId(value: string) {
		if (!value) {
			throw new Error("Workspace ID cannot be empty");
		}
		this._workspaceId = value;
	}

	public set spaceId(value: string) {
		if (!value) {
			throw new Error("Space ID cannot be empty");
		}
		this._spaceId = value;
	}

	public set category(value: VideoCategory) {
		this._category = value;
	}

	public set type(value: VideoType) {
		if (
			this._type === VideoType.LIVE &&
			value === VideoType.VOD &&
			this._liveStreamStatus === VideoStatus.PROCESSING
		) {
			throw new Error(
				"Cannot change type from LIVE to VOD while live stream is processing"
			);
		}
		this._type = value;
	}

	public set isPublic(value: boolean) {
		if (value && this._processing) {
			throw new Error("Cannot make video public while processing");
		}
		if (value && this._transcodeStatus !== VideoStatus.SUCCESS) {
			throw new Error("Video must be successfully transcoded to be public");
		}
		this._isPublic = value;
	}

	toObject(): IVideoEntity {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			createdAt: this.createdAt,
			userId: this.userId,
			totalViews: this.totalViews,
			uniqueViews: this.uniqueViews,
			transcription: this.transcription,
			duration: this.duration,
			folderId: this.folderId,
			workspaceId: this.workspaceId,
			spaceId: this.spaceId,
			category: this.category,
			type: this.type,
			liveStreamStatus: this.liveStreamStatus,
			processing: this.processing,
			transcodeStatus: this.transcodeStatus,
			uploaded: this.uploaded,
			thumbnailStatus: this.thumbnailStatus,
			transcriptionStatus: this.transcriptionStatus,
			titleStatus: this.titleStatus,
			descriptionStatus: this.descriptionStatus,
			isPublic: this.isPublic,
		};
	}
}

// Type for status keys to ensure type safety
type StatusKey =
	| "liveStreamStatus"
	| "transcodeStatus"
	| "uploaded"
	| "thumbnailStatus"
	| "transcriptionStatus"
	| "titleStatus"
	| "descriptionStatus";
