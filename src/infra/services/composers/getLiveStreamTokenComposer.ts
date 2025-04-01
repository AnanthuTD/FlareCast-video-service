import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IWorkspaceService, WorkspaceService } from "@/app/services/implementation/WorkspaceService";
import { IGetLiveStreamTokenUseCase } from "@/app/usecases/video/IGetLiveStreamTokenUseCase";
import { GetLiveStreamTokenUseCase } from "@/app/usecases/video/implementation/GetLiveStreamTokenUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { GetLiveStreamTokenController } from "@/presentation/http/controllers/video/GetLiveStreamToken";

export function getLiveStreamTokenComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const workspaceService: IWorkspaceService = new WorkspaceService();
  const useCase: IGetLiveStreamTokenUseCase = new GetLiveStreamTokenUseCase(
    videoRepository,
    workspaceService,
  );
  const controller: IController = new GetLiveStreamTokenController(useCase);
  return controller;
}