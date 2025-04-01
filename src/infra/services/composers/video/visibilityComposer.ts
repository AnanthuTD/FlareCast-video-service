import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { VisibilityUseCase } from "@/app/usecases/video/implementation/VisibilityUseCase";
import { IVisibilityUseCase } from "@/app/usecases/video/IVisibilityUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { VisibilityController } from "@/presentation/http/controllers/video/Visibility";

export function visibilityComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const useCase: IVisibilityUseCase = new VisibilityUseCase(videoRepository);
  const controller: IController = new VisibilityController(useCase);
  return controller;
}