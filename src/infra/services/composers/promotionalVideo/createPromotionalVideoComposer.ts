import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IS3Service, S3Service } from "@/app/services/implementation/S3Service";
import { ICreatePromotionalVideoUseCase } from "@/app/usecases/promotionalVideo/ICreatePromotionalVideoUseCase";
import { CreatePromotionalVideoUseCase } from "@/app/usecases/promotionalVideo/implementation/CreatePromotionalVideoUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { CreatePromotionalVideoController } from "@/presentation/http/controllers/promotionalVideo/CreatePromotionalVideo";

/**
 * Composer function for creating and configuring the components required for creating a promotional video.
 *
 * @function
 * @returns {IController} The configured create promotional video controller.
 */
export function createPromotionalVideoComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const s3Service: IS3Service = new S3Service();
  const useCase: ICreatePromotionalVideoUseCase = new CreatePromotionalVideoUseCase(
    videoRepository,
    s3Service
  );
  const controller: IController = new CreatePromotionalVideoController(useCase);
  return controller;
}