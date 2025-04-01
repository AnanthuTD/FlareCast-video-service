import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IS3Service } from "@/app/services/implementation/S3Service";
import { IKafkaService } from "@/app/services/KafkaService";
import { logger } from "@/infra/logger";
import { IDeleteVideoUseCase } from "../IDeleteVideoUseCase";
import { DeleteVideoDTO } from "@/domain/dtos/video/DeleteVideoDTO";
import { DeleteVideoResponseDTO } from "@/domain/dtos/video/DeleteVideoResponseDTO";
import { DeleteVideoErrorType } from "@/domain/enums/video/DeleteVideoErrorType";

export class DeleteVideoUseCase implements IDeleteVideoUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly s3Service: IS3Service,
    private readonly kafkaService: IKafkaService
  ) {}

  async execute(
    dto: DeleteVideoDTO
  ): Promise<
    ResponseDTO & {
      data: DeleteVideoResponseDTO | { error: DeleteVideoErrorType };
    }
  > {
    const { videoId, userId } = dto;

    if (!videoId || !userId) {
      return {
        success: false,
        data: { error: DeleteVideoErrorType.INVALID_INPUT },
      };
    }

    try {
      // Check if video exists
      const video = await this.videoRepository.findById(videoId);
      if (!video) {
        return {
          success: false,
          data: { error: DeleteVideoErrorType.VIDEO_NOT_FOUND },
        };
      }

      // TODO: Add permission check (e.g., userId matches video.userId or role-based access)
      // For now, assume user has permission; implement logic as needed
      // if (video.userId !== userId) {
      //   return { success: false, data: { error: DeleteVideoErrorType.UNAUTHORIZED } };
      // }

      // Delete S3 objects
      const deletedObjects = await this.s3Service.deleteObjectsByPrefix(`${videoId}/`);
      if (deletedObjects.length > 0) {
        logger.info(`Successfully deleted S3 objects for video ${videoId} from gcs/${videoId}/`);
      } else {
        logger.warn(`No S3 objects found for video ${videoId} in gcs/${videoId}/`);
      }

      // Delete video from database
      await this.videoRepository.delete(videoId);

      // Publish Kafka event
      await this.kafkaService.sendVideoRemovedEvent({ videoId, userId });

      logger.info(`Successfully deleted video ${videoId} from database and S3`);

      return {
        success: true,
        data: { message: "Video deleted successfully" },
      };
    } catch (error) {
      logger.error(`Failed to delete video ${videoId}:`, error);
      return {
        success: false,
        data: { error: DeleteVideoErrorType.INTERNAL_ERROR },
      };
    }
  }
}