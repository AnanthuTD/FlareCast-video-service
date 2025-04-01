import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { SSEService } from "@/app/services/implementation/SSEService";
import { ISSEService } from "@/app/services/ISSEService";
import { IEventsUseCase } from "@/app/usecases/video/IEventsUseCase";
import { EventsUseCase } from "@/app/usecases/video/implementation/EventsUseCase";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { EventsController } from "@/presentation/http/controllers/video/EventsController";
import { Response } from "express";

/**
 * Composer function for configuring the SSE events controller.
 *
 * @function
 * @returns {IController} The configured events controller.
 */
export function eventsComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const sseService: ISSEService = new SSEService();
  const useCase: IEventsUseCase = new EventsUseCase(sseService);
  const controller: IController = new EventsController(useCase, sseService);
  return controller;
}