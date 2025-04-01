import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IEventService } from "@/app/services/IEventService";
import { EventService } from "@/app/services/implementation/EventService";
import { OnSuccessUseCase } from "@/app/usecases/video/implementation/OnSuccessUseCase";
import { IOnSuccessUseCase } from "@/app/usecases/video/IOnSuccessUseCase";
import { KafkaEventPublisher } from "@/infra/providers/KafkaEventPublisher";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { IController } from "@/presentation/http/controllers/IController";
import { VideoEditSuccessController } from "@/presentation/http/controllers/video/EditSuccess";

/**
 * Composer function for configuring the on success controller.
 *
 * @function
 * @returns {IController} The configured controller.
 */
export function videoEditSuccessComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const eventPublisher = new KafkaEventPublisher()
  const videoUploadEventProducer: IEventService = new EventService(eventPublisher);
  const useCase: IOnSuccessUseCase = new OnSuccessUseCase(
    videoRepository,
    videoUploadEventProducer
  );
  const controller: IController = new VideoEditSuccessController(useCase);
  return controller;
}