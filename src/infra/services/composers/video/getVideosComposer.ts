import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IGetVideosUseCase } from "@/app/usecases/video/IGetVideosUseCase";
import { GetVideosUseCase } from "@/app/usecases/video/implementation/GetVideosUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { GetVideosController } from "@/presentation/http/controllers/video/GetVideos";

/**
 * Composer function for configuring the get videos controller.
 *
 * @function
 * @returns {IController} The configured get videos controller.
 */
export function getVideosComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const useCase: IGetVideosUseCase = new GetVideosUseCase(videoRepository);
  const controller: IController = new GetVideosController(useCase);
  return controller;
}