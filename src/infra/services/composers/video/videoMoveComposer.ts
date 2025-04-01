import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IPermissionService, PermissionService } from "@/app/services/implementation/PermissionService";
import { VideoMoveUseCase } from "@/app/usecases/video/implementation/VideoMoveUseCase";
import { IVideoMoveUseCase } from "@/app/usecases/video/IVideoMoveUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { VideoMoveController } from "@/presentation/http/controllers/video/VideoMove";

/**
 * Composer function for configuring the video move controller.
 *
 * @function
 * @returns {IController} The configured controller.
 */
export function videoMoveComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const permissionService: IPermissionService = new PermissionService();
  const useCase: IVideoMoveUseCase = new VideoMoveUseCase(
    videoRepository,
    permissionService
  );
  const controller: IController = new VideoMoveController(useCase);
  return controller;
}