import { ResponseDTO } from "@/domain/dtos/Response";
import { SendChatMessageDTO } from "@/domain/dtos/chat/SendChatMessageDTO";
import { SendChatMessageResponseDTO } from "@/domain/dtos/chat/SendChatMessageResponseDTO";
import { ISendChatMessageUseCase } from "../ISendChatMessageUseCase";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IChatRepository } from "@/app/repository/IChatRepository";
import { IChatAIService } from "@/app/services/implementation/ChatAIService";
import { SendChatMessageErrorType } from "@/domain/enums/chat/SendChatMessageErrorType";

export class SendChatMessageUseCase implements ISendChatMessageUseCase {
	constructor(
		private readonly videoRepository: IVideoRepository,
		private readonly chatRepository: IChatRepository,
		private readonly chatAIService: IChatAIService
	) {}

	async execute(dto: SendChatMessageDTO): Promise<
		ResponseDTO & {
			data: SendChatMessageResponseDTO | { error: SendChatMessageErrorType };
		}
	> {
		const { videoId, query, userId } = dto;

		// Validation: Ensure required fields are present
		if (!videoId || !query || !userId) {
			return {
				success: false,
				data: { error: SendChatMessageErrorType.MISSING_FIELDS },
			};
		}

		// Business Rule: Check if the video exists
		const video = await this.videoRepository.findById(videoId);
		if (!video) {
			return {
				success: false,
				data: { error: SendChatMessageErrorType.VIDEO_NOT_FOUND },
			};
		}

		const sessionId = `videoId${videoId}-userId-${userId}`;

		try {
			// Query AI service
			const answer = await this.chatAIService.queryTranscript(
				videoId,
				userId,
				sessionId,
				query
			);

			// Save user message
			const userChat = await this.chatRepository.createChat({
				videoId,
				userId,
				message: query,
				sessionId,
			});

			// Save AI response
			await this.chatRepository.createChat({
				videoId,
				message: answer,
				repliedToId: userChat.id,
				sessionId,
			});

			return {
				success: true,
				data: {
					answer,
					sessionId,
				},
			};
		} catch (error) {
			return {
				success: false,
				data: { error: SendChatMessageErrorType.SERVICE_UNAVAILABLE },
			};
		}
	}
}
