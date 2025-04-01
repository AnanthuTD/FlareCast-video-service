import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { UpdateVideoTitleUseCase } from "@/app/usecases/video/implementation/UpdateVideoTitleUseCase";
import { IUpdateVideoTitleUseCase } from "@/app/usecases/video/IUpdateVideoTitleUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { UpdateVideoTitleController } from "@/presentation/http/controllers/video/UpdateVideoTitle";

/**
 * Composer function for configuring the update video title controller.
 *
 * @function
 * @returns {IController} The configured controller.
 */
export function updateVideoTitleComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const useCase: IUpdateVideoTitleUseCase = new UpdateVideoTitleUseCase(videoRepository);
  const controller: IController = new UpdateVideoTitleController(useCase);
  return controller;
}