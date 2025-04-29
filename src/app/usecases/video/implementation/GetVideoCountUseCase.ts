import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { ICollaborationService } from "@/app/services/ICollaborationService";
import { logger } from "@/infra/logger";
import { IGetVideoCountUseCase } from "../IGetVideoCountUseCase";
import { GetVideoCountDTO } from "@/domain/dtos/video/GetVideoCountDTO";
import { GetVideoCountErrorType } from "@/domain/enums/video/GetVideoCountErrorType";
import { GetVideoCountResponseDTO } from "@/domain/dtos/video/GetVideoCountResponseDTO";

export class GetVideoCountUseCase implements IGetVideoCountUseCase {
	constructor(
		private readonly videoRepository: IVideoRepository,
		private readonly collaborationService: ICollaborationService
	) {}

	async execute(dto: GetVideoCountDTO): Promise<
		ResponseDTO & {
			data: GetVideoCountResponseDTO | { error: GetVideoCountErrorType };
		}
	> {
		const { userId, folderId, spaceId, workspaceId } = dto;

		try {
			const filter: {
				folderId?: string;
				workspaceId?: string;
				spaceId?: string;
			} = {};

			if (folderId) filter.folderId = folderId;
			else if (spaceId) filter.spaceId = spaceId;
			else if (workspaceId) filter.workspaceId = workspaceId;
			else {
				return {
					success: false,
					data: { error: GetVideoCountErrorType.INSUFFICIENT_DATA },
				};
			}

			const videoCount = await this.videoRepository.countVideos({
				...(folderId ? { folderId } : {}),
				spaceId,
				workspaceId,
			});

			return {
				success: true,
				data: {
					count: videoCount,
				},
			};
		} catch (error) {
			logger.error("Error fetching video details:", error);
			return {
				success: false,
				data: { error: GetVideoCountErrorType.INTERNAL_ERROR },
			};
		}
	}
}
