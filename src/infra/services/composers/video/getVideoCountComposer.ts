import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { ICollaborationService } from "@/app/services/ICollaborationService";
import { CollaborationService } from "@/app/services/implementation/CollaborationService";
import { IGetVideoCountUseCase } from "@/app/usecases/video/IGetVideoCountUseCase";
import { GetVideoCountUseCase } from "@/app/usecases/video/implementation/GetVideoCountUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { GetVideoCountController } from "@/presentation/http/controllers/video/GetVideoCount";

/**
 * Composer function for configuring the get video details controller.
 *
 * @function
 * @returns {IController} The configured controller.
 */
export function getVideoCountComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const collaborationService: ICollaborationService = new CollaborationService();
  const useCase: IGetVideoCountUseCase = new GetVideoCountUseCase(
    videoRepository,
    collaborationService
  );
  const controller: IController = new GetVideoCountController(useCase);
  return controller;
}