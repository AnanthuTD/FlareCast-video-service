import { Request } from "express";

export interface AuthenticatedRequest extends Request {
	user: {
		id: string;
	};
}

export interface VideoSuggestion {
	id: string;
	title: string;
	createdAt: string;
	score: number;
	user: { id: string; name: string };
	paginationToken?: string;
}