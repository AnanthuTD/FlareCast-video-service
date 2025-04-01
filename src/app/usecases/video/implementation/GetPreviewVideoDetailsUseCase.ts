import { ResponseDTO } from "@/domain/dtos/Response";
import { IGetPreviewVideoDetailsUseCase } from "../IGetPreviewVideoDetailsUseCase";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { GetPreviewVideoDetailsDTO } from "@/domain/dtos/video/GetPreviewVideoDetailsDTO";
import { GetPreviewVideoDetailsResponseDTO } from "@/domain/dtos/video/GetPreviewVideoDetailsResponseDTO";
import { GetPreviewVideoDetailsErrorType } from "@/domain/enums/video/GetPreviewVideoDetailsErrorType";
import { logger } from "@/infra/logger";

export class GetPreviewVideoDetailsUseCase
	implements IGetPreviewVideoDetailsUseCase
{
	constructor(private readonly videoRepository: IVideoRepository) {}

	async execute(dto: GetPreviewVideoDetailsDTO): Promise<
		ResponseDTO & {
			data:
				| GetPreviewVideoDetailsResponseDTO
				| { error: GetPreviewVideoDetailsErrorType };
		}
	> {
		const { videoId } = dto;

		try {
			const video = await this.videoRepository.findById(videoId);
			if (!video) {
				return {
					success: false,
					data: { error: GetPreviewVideoDetailsErrorType.VIDEO_NOT_FOUND },
				};
			}

			return {
				success: true,
				data: { video },
			};
		} catch (error) {
			logger.error("Error fetching preview video details:", error);
			return {
				success: false,
				data: { error: GetPreviewVideoDetailsErrorType.INTERNAL_ERROR },
			};
		}
	}
}
