import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IWatchLaterRepository } from "@/app/repository/IWatchLaterRepository";
import { ICollaborationService } from "@/app/services/ICollaborationService";
import { CollaborationService } from "@/app/services/implementation/CollaborationService";
import { IGetVideoDetailsUseCase } from "@/app/usecases/video/IGetVideoDetailsUseCase";
import { GetVideoDetailsUseCase } from "@/app/usecases/video/implementation/GetVideoDetailsUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { WatchLaterRepository } from "@/infra/repository/prisma/WatchLaterRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { GetVideoDetailsController } from "@/presentation/http/controllers/video/GetVideoDetails";

/**
 * Composer function for configuring the get video details controller.
 *
 * @function
 * @returns {IController} The configured controller.
 */
export function getVideoDetailsComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const watchLaterRepository: IWatchLaterRepository = new WatchLaterRepository();
  const collaborationService: ICollaborationService = new CollaborationService();
  const useCase: IGetVideoDetailsUseCase = new GetVideoDetailsUseCase(
    videoRepository,
    watchLaterRepository,
    collaborationService
  );
  const controller: IController = new GetVideoDetailsController(useCase);
  return controller;
}