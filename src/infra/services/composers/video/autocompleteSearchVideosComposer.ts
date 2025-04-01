import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { AutocompleteSearchVideosUseCase } from "@/app/usecases/video/implementation/AutocompleteSearchVideosUseCase";
import { IAutocompleteSearchVideosUseCase } from "@/app/usecases/video/IAutocompleteSearchVideosUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { AutocompleteSearchVideosController } from "@/presentation/http/controllers/video/AutocompleteSearchVideos";

/**
 * Composer function for creating and configuring the components required for autocomplete video search.
 *
 * @function
 * @returns {IController} The configured autocomplete search videos controller.
 */
export function autocompleteSearchVideosComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const useCase: IAutocompleteSearchVideosUseCase = new AutocompleteSearchVideosUseCase(videoRepository);
  const controller: IController = new AutocompleteSearchVideosController(useCase);
  return controller;
}