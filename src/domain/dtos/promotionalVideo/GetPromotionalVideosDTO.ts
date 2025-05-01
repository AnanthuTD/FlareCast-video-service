export interface GetPromotionalVideosDTO {
	skip: number;
	limit: number;
	category: "PROMOTIONAL" | "GET_STARTED" | "DEFAULT";
	role: 'admin' | 'user'
}
