import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IGeneratePresignedUrlUseCase } from "../IGeneratePresignedUrlUseCase";
import { IS3Service } from "@/app/services/IS3Service";
import { GeneratePresignedUrlDTO } from "@/domain/dtos/video/GeneratePresignedUrlDTO";
import { GeneratePresignedUrlResponseDTO } from "@/domain/dtos/video/GeneratePresignedUrlResponseDTO";
import { GeneratePresignedUrlErrorType } from "@/domain/enums/video/GeneratePresignedUrlErrorType";
import { logger } from "@/infra/logger";

export class GeneratePresignedUrlUseCase implements IGeneratePresignedUrlUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly s3Service: IS3Service
  ) {}

  async execute(
    dto: GeneratePresignedUrlDTO
  ): Promise<
    ResponseDTO & {
      data: GeneratePresignedUrlResponseDTO | { error: GeneratePresignedUrlErrorType };
    }
  > {
    const { userId, videoId } = dto;

    if (!videoId) {
      return {
        success: false,
        data: { error: GeneratePresignedUrlErrorType.INVALID_INPUT },
      };
    }

    try {
      const video = await this.videoRepository.findById(videoId);
      if (!video) {
        return {
          success: false,
          data: { error: GeneratePresignedUrlErrorType.VIDEO_NOT_FOUND },
        };
      }

      // Basic permission check
      if (video.userId !== userId) {
        // TODO: Add more sophisticated permission logic if needed
        return {
          success: false,
          data: { error: GeneratePresignedUrlErrorType.UNAUTHORIZED },
        };
      }

      const editedVideo = await this.videoRepository.create({
        title: `edited-${video.title || "untitled"}`,
        userId: video.userId,
        workspaceId: video.workspaceId,
        folderId: video.folderId || undefined,
      });

      const key = `${editedVideo.id}/original.webm`;
      const signedUrl = await this.s3Service.generatePresignedUrl(key, "video/webm");

      logger.debug(`Generated presigned URL for video ${editedVideo.id}: ${signedUrl}`);

      return {
        success: true,
        data: { signedUrl, videoId: editedVideo.id, key },
      };
    } catch (error) {
      logger.error("Error generating presigned URL:", error);
      return {
        success: false,
        data: { error: GeneratePresignedUrlErrorType.INTERNAL_ERROR },
      };
    }
  }
}