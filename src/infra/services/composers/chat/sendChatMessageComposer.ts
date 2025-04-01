import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IChatRepository } from "@/app/repository/IChatRepository";
import { SendChatMessageUseCase } from "@/app/usecases/chat/implementation/SendChatMessageUseCase";
import { ISendChatMessageUseCase } from "@/app/usecases/chat/ISendChatMessageUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { ChatRepository } from "@/infra/repository/prisma/ChatRepository";
import { ChatAIService, IChatAIService } from "@/app/services/implementation/ChatAIService";
import { IController } from "@/presentation/http/controllers/IController";
import { SendChatMessageController } from "@/presentation/http/controllers/chat/SendChatMessage";

/**
 * Composer function for creating and configuring the components required for sending a chat message.
 *
 * @function
 * @returns {IController} The configured send chat message controller.
 */
export function sendChatMessageComposer(): IController {
	const videoRepository: IVideoRepository = new VideoRepository();
	const chatRepository: IChatRepository = new ChatRepository();
	const chatAIService: IChatAIService = new ChatAIService(
		videoRepository,
		chatRepository
	);
	const useCase: ISendChatMessageUseCase = new SendChatMessageUseCase(
		videoRepository,
		chatRepository,
		chatAIService
	);
	const controller: IController = new SendChatMessageController(useCase);
	return controller;
}
