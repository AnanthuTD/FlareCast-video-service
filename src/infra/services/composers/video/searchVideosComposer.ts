import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { SearchVideosUseCase } from "@/app/usecases/video/implementation/SearchVideosUseCase";
import { ISearchVideosUseCase } from "@/app/usecases/video/ISearchVideosUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { SearchVideosController } from "@/presentation/http/controllers/video/SearchVideos";

/**
 * Composer function for configuring the search videos controller.
 *
 * @function
 * @returns {IController} The configured controller.
 */
export function searchVideosComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const useCase: ISearchVideosUseCase = new SearchVideosUseCase(videoRepository);
  const controller: IController = new SearchVideosController(useCase);
  return controller;
}