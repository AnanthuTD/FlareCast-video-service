import { IChatRepository } from "@/app/repository/IChatRepository";
import { ClearChatSessionUseCase } from "@/app/usecases/chat/implementation/ClearChatSessionUseCase";
import { IClearChatSessionUseCase } from "@/app/usecases/chat/IClearChatSessionUseCase";
import { ChatRepository } from "@/infra/repository/prisma/ChatRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { ClearChatSessionController } from "@/presentation/http/controllers/chat/ClearChatSession";

/**
 * Composer function for creating and configuring the components required for clearing a chat session.
 *
 * @function
 * @returns {IController} The configured clear chat session controller.
 */
export function clearChatSessionComposer(): IController {
  const chatRepository: IChatRepository = new ChatRepository();
  const useCase: IClearChatSessionUseCase = new ClearChatSessionUseCase(chatRepository);
  const controller: IController = new ClearChatSessionController(useCase);
  return controller;
}