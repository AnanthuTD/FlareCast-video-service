import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IGetPromotionalVideosUseCase } from "@/app/usecases/promotionalVideo/IGetPromotionalVideosUseCase";
import { GetPromotionalVideosUseCase } from "@/app/usecases/promotionalVideo/implementation/GetPromotionalVideosUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { GetPromotionalVideosController } from "@/presentation/http/controllers/promotionalVideo/GetPromotionalVideos";

/**
 * Composer function for configuring the get promotional videos controller.
 *
 * @function
 * @returns {IController} The configured get promotional videos controller.
 */
export function getPromotionalVideosComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const useCase: IGetPromotionalVideosUseCase = new GetPromotionalVideosUseCase(videoRepository);
  const controller: IController = new GetPromotionalVideosController(useCase);
  return controller;
}