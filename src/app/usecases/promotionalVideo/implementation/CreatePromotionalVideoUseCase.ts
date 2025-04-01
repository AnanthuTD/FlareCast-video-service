import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { logger } from "@/infra/logger";
import { VideoStatus } from "@/domain/entities/Video";
import { ICreatePromotionalVideoUseCase } from "../ICreatePromotionalVideoUseCase";
import { CreatePromotionalVideoDTO } from "@/domain/dtos/promotionalVideo/CreatePromotionalVideoDTO";
import { CreatePromotionalVideoResponseDTO } from "@/domain/dtos/promotionalVideo/CreatePromotionalVideoResponseDTO";
import { CreatePromotionalVideoErrorType } from "@/domain/enums/promotionalVideo/CreatePromotionalVideoErrorType";
import { IS3Service } from "@/app/services/IS3Service";

export class CreatePromotionalVideoUseCase
	implements ICreatePromotionalVideoUseCase
{
	constructor(
		private readonly videoRepository: IVideoRepository,
		private readonly s3Service: IS3Service
	) {}

	async execute(dto: CreatePromotionalVideoDTO): Promise<
		ResponseDTO & {
			data:
				| CreatePromotionalVideoResponseDTO
				| { error: CreatePromotionalVideoErrorType };
		}
	> {
		const { title, description, videoExtension } = dto;

		// Validation: Ensure required fields are present
		if (!title || !videoExtension) {
			return {
				success: false,
				data: { error: CreatePromotionalVideoErrorType.INVALID_INPUT },
			};
		}

		try {
			// Create the video entity in the database
			const newVideo = await this.videoRepository.create({
				title,
				description,
			});

			// Update video with promotional-specific details
			const updatedVideo = await this.videoRepository.updateTitleAndDescription(
				newVideo.id,
				title,
				description,
				VideoStatus.SUCCESS // Assuming VideoStatus.SUCCESS; adjust enum if needed
			);

			// Set category and type (assuming these can be updated separately or added to createVideo)
			const promotionalVideo = await this.videoRepository.setPromotionalVideo(
				newVideo.id
			);

			// Generate S3 signed URL
			const key = `${newVideo.id}/original.${videoExtension}`;
			const signedUrl = await this.s3Service.generateUploadUrl(
				key,
				`video/${videoExtension}`
			);

			return {
				success: true,
				data: {
					message: "Promotional video created successfully",
					videoId: newVideo.id,
					signedUrl,
				},
			};
		} catch (error) {
			logger.error("Error creating promotional video:", error);
			return {
				success: false,
				data: { error: CreatePromotionalVideoErrorType.INTERNAL_ERROR },
			};
		}
	}
}
