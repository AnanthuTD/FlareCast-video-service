export interface ChatProps {
	id: string;
	videoId: string;
	userId: string | null;
	message: string;
	repliedToId: string | null;
	createdAt: Date;
	sessionId: string;
	repliedTo?: ChatEntity | null;
}

export class ChatEntity {
	private _id: string;
	private _videoId: string;
	private _userId: string | null;
	private _message: string;
	private _repliedToId: string | null;
	private _createdAt: Date;
	private _sessionId: string;
	private _repliedTo: ChatEntity | null;

	constructor(props: ChatProps) {
		this._id = props.id;
		this._videoId = props.videoId;
		this._userId = props.userId;
		this._message = props.message;
		this._repliedToId = props.repliedToId;
		this._createdAt = props.createdAt;
		this._sessionId = props.sessionId;
		this._repliedTo = props.repliedTo || null;
		this.validate();
	}

	private validate(): void {
		if (!this._videoId) throw new Error("Video ID is required");
		if (!this._message.trim()) throw new Error("Message cannot be empty");
		if (this._repliedToId === this._id) throw new Error("Cannot reply to self");
	}

	public reply(
		message: string,
		userId: string | null,
		sessionId: string
	): ChatEntity {
		return new ChatEntity({
			id: crypto.randomUUID(),
			videoId: this._videoId,
			userId,
			message,
			repliedToId: this._id,
			createdAt: new Date(),
			sessionId,
			repliedTo: this,
		});
	}

	get id(): string {
		return this._id;
	}
	get videoId(): string {
		return this._videoId;
	}
	get userId(): string | null {
		return this._userId;
	}
	get message(): string {
		return this._message;
	}
	get repliedToId(): string | null {
		return this._repliedToId;
	}
	get createdAt(): Date {
		return this._createdAt;
	}
	get sessionId(): string {
		return this._sessionId;
	}
	get repliedTo(): ChatEntity | null {
		return this._repliedTo;
	}
}