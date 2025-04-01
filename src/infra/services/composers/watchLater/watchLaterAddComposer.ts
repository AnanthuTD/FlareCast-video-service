import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IWatchLaterRepository } from "@/app/repository/IWatchLaterRepository";
import { WatchLaterAddUseCase } from "@/app/usecases/watchLater/implementation/WatchLaterAddUseCase";
import { IWatchLaterAddUseCase } from "@/app/usecases/watchLater/IWatchLaterAddUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { WatchLaterRepository } from "@/infra/repository/prisma/WatchLaterRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { WatchLaterAddController } from "@/presentation/http/controllers/watchLater/WatchLaterAdd";

export function watchLaterAddComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const watchLaterRepository: IWatchLaterRepository = new WatchLaterRepository();
  const useCase: IWatchLaterAddUseCase = new WatchLaterAddUseCase(videoRepository, watchLaterRepository);
  const controller: IController = new WatchLaterAddController(useCase);
  return controller;
}