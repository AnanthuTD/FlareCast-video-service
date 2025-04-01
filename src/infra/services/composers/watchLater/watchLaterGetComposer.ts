import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IWatchLaterRepository } from "@/app/repository/IWatchLaterRepository";
import { WatchLaterGetUseCase } from "@/app/usecases/watchLater/implementation/WatchLaterGetUseCase";
import { IWatchLaterGetUseCase } from "@/app/usecases/watchLater/IWatchLaterGetUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { WatchLaterRepository } from "@/infra/repository/prisma/WatchLaterRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { WatchLaterGetController } from "@/presentation/http/controllers/watchLater/WatchLaterGet";

export function watchLaterGetComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const watchLaterRepository: IWatchLaterRepository = new WatchLaterRepository();
  const useCase: IWatchLaterGetUseCase = new WatchLaterGetUseCase(videoRepository, watchLaterRepository);
  const controller: IController = new WatchLaterGetController(useCase);
  return controller;
}