import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { UpdateVideoVisibilityUseCase } from "@/app/usecases/video/implementation/UpdateVisibilityUseCase";
import { IUpdateVideoVisibilityUseCase } from "@/app/usecases/video/IUpdateVisibilityUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { UpdateVideoVisibilityController } from "@/presentation/http/controllers/video/UpdateVisibility";


/**
 * Composer function for creating and configuring the components required for updating video visibility.
 *
 * @function
 * @returns {IController} The configured update video visibility controller.
 */
export function createUpdateVideoVisibilityComposer(): IController {
  const repository: IVideoRepository = new VideoRepository();
  const useCase: IUpdateVideoVisibilityUseCase = new UpdateVideoVisibilityUseCase(repository);
  const controller: IController = new UpdateVideoVisibilityController(useCase);
  return controller;
}