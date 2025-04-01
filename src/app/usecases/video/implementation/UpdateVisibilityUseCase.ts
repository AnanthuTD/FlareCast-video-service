import { ResponseDTO } from "@/domain/dtos/Response";
import { UpdateVideoVisibilityDTO } from "@/domain/dtos/video/UpdateVideoVisibilityDTO";
import { UpdateVideoVisibilityResponseDTO } from "@/domain/dtos/video/UpdateVideoVisibilityResponseDTO";
import { IUpdateVideoVisibilityUseCase } from "../IUpdateVisibilityUseCase";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { UpdateVideoVisibilityErrorType } from "@/domain/enums/video/UpdateVideoVisibilityErrorType";

export class UpdateVideoVisibilityUseCase
	implements IUpdateVideoVisibilityUseCase
{
	constructor(private readonly videoRepository: IVideoRepository) {}
	async execute(
		dto: UpdateVideoVisibilityDTO
	): Promise<
		ResponseDTO & {
			data: UpdateVideoVisibilityResponseDTO | { message: string; details?: any };
		}
	> {
		const video = await this.videoRepository.findById(dto.id);

		if (!video) {
			return {
				success: false,
				data: {
					message: UpdateVideoVisibilityErrorType.VIDEO_NOT_FOUND,
				},
			};
		}

		const visibility = await this.videoRepository.updateVisibility(
			dto.id,
			dto.visibility
		);

		return {
			success: true,
			data: {
				isPublic: visibility.isPublic,
			},
		};
	}
}
