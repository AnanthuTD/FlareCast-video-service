import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { S3Service } from "@/app/services/implementation/S3Service";
import { IS3Service } from "@/app/services/IS3Service";
import { IGeneratePresignedUrlUseCase } from "@/app/usecases/video/IGeneratePresignedUrlUseCase";
import { GeneratePresignedUrlUseCase } from "@/app/usecases/video/implementation/GeneratePresignedUrlUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { GeneratePresignedUrlController } from "@/presentation/http/controllers/video/GeneratePresignedUrl";

/**
 * Composer function for configuring the generate presigned URL controller.
 *
 * @function
 * @returns {IController} The configured controller.
 */
export function generatePresignedUrlComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const s3Service: IS3Service = new S3Service();
  const useCase: IGeneratePresignedUrlUseCase = new GeneratePresignedUrlUseCase(
    videoRepository,
    s3Service
  );
  const controller: IController = new GeneratePresignedUrlController(useCase);
  return controller;
}