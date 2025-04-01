import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IGetPreviewVideoDetailsUseCase } from "@/app/usecases/video/IGetPreviewVideoDetailsUseCase";
import { GetPreviewVideoDetailsUseCase } from "@/app/usecases/video/implementation/GetPreviewVideoDetailsUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { GetPreviewVideoDetailsController } from "@/presentation/http/controllers/video/GetPreviewVideoDetails";

/**
 * Composer function for configuring the get preview video details controller.
 *
 * @function
 * @returns {IController} The configured controller.
 */
export function getPreviewVideoDetailsComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const useCase: IGetPreviewVideoDetailsUseCase = new GetPreviewVideoDetailsUseCase(
    videoRepository
  );
  const controller: IController = new GetPreviewVideoDetailsController(useCase);
  return controller;
}