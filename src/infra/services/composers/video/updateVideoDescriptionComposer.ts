import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { UpdateVideoDescriptionUseCase } from "@/app/usecases/video/implementation/UpdateVideoDescriptionUseCase";
import { IUpdateVideoDescriptionUseCase } from "@/app/usecases/video/IUpdateVideoDescriptionUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { UpdateVideoDescriptionController } from "@/presentation/http/controllers/video/UpdateVideoDescription";

/**
 * Composer function for configuring the update video description controller.
 *
 * @function
 * @returns {IController} The configured controller.
 */
export function updateVideoDescriptionComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const useCase: IUpdateVideoDescriptionUseCase = new UpdateVideoDescriptionUseCase(videoRepository);
  const controller: IController = new UpdateVideoDescriptionController(useCase);
  return controller;
}