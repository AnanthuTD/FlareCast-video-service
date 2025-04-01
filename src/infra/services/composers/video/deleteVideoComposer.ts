import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { VideoRepository } from "@/infra/repository/prisma/VideoRepository";
import { S3Service } from "@/app/services/implementation/S3Service";
import { IController } from "@/presentation/http/controllers/IController";
import { DeleteVideoUseCase } from "@/app/usecases/video/implementation/DeleteVideoUseCase";
import { IDeleteVideoUseCase } from "@/app/usecases/video/IDeleteVideoUseCase";
import { DeleteVideoController } from "@/presentation/http/controllers/video/DeleteVideo";
import { IS3Service } from "@/app/services/IS3Service";
import { IEventService } from "@/app/services/IEventService";
import { EventService } from "@/app/services/implementation/EventService";
import { KafkaEventPublisher } from "@/infra/providers/KafkaEventPublisher";
import { IEventPublisher } from "@/app/interfaces/IEventPublisher";

/**
 * Composer function for creating and configuring the components required for deleting a video.
 *
 * @function
 * @returns {IController} The configured delete video controller.
 */
export function deleteVideoComposer(): IController {
  const videoRepository: IVideoRepository = new VideoRepository();
  const s3Service: IS3Service = new S3Service();
  const eventPublisher: IEventPublisher = new KafkaEventPublisher()
  const kafkaService: IEventService = new EventService(eventPublisher);
  const useCase: IDeleteVideoUseCase = new DeleteVideoUseCase(
    videoRepository,
    s3Service,
    kafkaService
  );
  const controller: IController = new DeleteVideoController(useCase);
  return controller;
}