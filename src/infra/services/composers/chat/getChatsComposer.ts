import { IChatRepository } from "@/app/repository/IChatRepository";
import { GetChatsUseCase } from "@/app/usecases/chat/implementation/GetChatsUseCase";
import { IGetChatsUseCase } from "@/app/usecases/chat/IGetChatsUseCase";
import { ChatRepository } from "@/infra/repository/prisma/ChatRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { GetChatsController } from "@/presentation/http/controllers/chat/GetChats";

/**
 * Composer function for creating and configuring the components required for fetching chats.
 *
 * @function
 * @returns {IController} The configured get chats controller.
 */
export function getChatsComposer(): IController {
  const chatRepository: IChatRepository = new ChatRepository();
  const useCase: IGetChatsUseCase = new GetChatsUseCase(chatRepository);
  const controller: IController = new GetChatsController(useCase);
  return controller;
}