export interface CreatePromotionalVideoDTO {
	title: string;
	description: string;
	videoExtension: string;
	category: "PROMOTIONAL" | "GET_STARTED" | "DEFAULT";
}
