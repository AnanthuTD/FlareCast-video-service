import { IEventPublisher } from "@/app/interfaces/IEventPublisher";
import { IEventService } from "@/app/services/IEventService";
import { EventService } from "@/app/services/implementation/EventService";
import { VideoViewUseCase } from "@/app/usecases/video/implementation/VideoViewUseCase";
import { IVideoViewUseCase } from "@/app/usecases/video/IVideoViewUseCase";
import { KafkaEventPublisher } from "@/infra/providers/KafkaEventPublisher";
import { IController } from "@/presentation/http/controllers/IController";
import { VideoViewController } from "@/presentation/http/controllers/video/VideoView";


/**
 * Composer function for configuring the video view controller.
 *
 * @function
 * @returns {IController} The configured controller.
 */
export function videoViewComposer(): IController {
  const eventPublisher: IEventPublisher = new KafkaEventPublisher()
  const eventService: IEventService = new EventService(eventPublisher);
  const useCase: IVideoViewUseCase = new VideoViewUseCase(eventService);
  const controller: IController = new VideoViewController(useCase);
  return controller;
}