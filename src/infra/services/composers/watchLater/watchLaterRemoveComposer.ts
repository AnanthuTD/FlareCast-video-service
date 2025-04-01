import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IWatchLaterRepository } from "@/app/repository/IWatchLaterRepository";
import { WatchLaterRemoveUseCase } from "@/app/usecases/watchLater/implementation/WatchLaterRemoveUseCase";
import { IWatchLaterRemoveUseCase } from "@/app/usecases/watchLater/IWatchLaterRemoveUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { WatchLaterRepository } from "@/infra/repository/prisma/WatchLaterRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { WatchLaterRemoveController } from "@/presentation/http/controllers/watchLater/WatchLaterRemove";

export function watchLaterRemoveComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const watchLaterRepository: IWatchLaterRepository = new WatchLaterRepository();
  const useCase: IWatchLaterRemoveUseCase = new WatchLaterRemoveUseCase(videoRepository, watchLaterRepository);
  const controller: IController = new WatchLaterRemoveController(useCase);
  return controller;
}