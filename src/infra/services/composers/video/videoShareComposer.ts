import { IAwsRepository } from "@/app/repository/IAwsRepository";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IPermissionService, PermissionService } from "@/app/services/implementation/PermissionService";
import { VideoShareUseCase } from "@/app/usecases/video/implementation/VideoShareUseCase";
import { IVideoShareUseCase } from "@/app/usecases/video/IVideoShareUseCase";
import { AwsRepository } from "@/infra/repository/prisma/AwsRepository";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { VideoShareController } from "@/presentation/http/controllers/video/VideoShare";

/**
 * Composer function for configuring the video share controller.
 *
 * @function
 * @returns {IController} The configured controller.
 */
export function videoShareComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const permissionService: IPermissionService = new PermissionService();
  const awsRepository: IAwsRepository = new AwsRepository();
  const useCase: IVideoShareUseCase = new VideoShareUseCase(
    videoRepository,
    permissionService,
    awsRepository
  );
  const controller: IController = new VideoShareController(useCase);
  return controller;
}