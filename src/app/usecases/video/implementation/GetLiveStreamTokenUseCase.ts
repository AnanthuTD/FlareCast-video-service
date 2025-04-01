import { ResponseDTO } from "@/domain/dtos/Response";
import { GetLiveStreamTokenDTO } from "@/domain/dtos/video/GetLiveStreamTokenDTO";
import { GetLiveStreamTokenResponseDTO } from "@/domain/dtos/video/GetLiveStreamTokenResponseDTO";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { GetLiveStreamTokenErrorType } from "@/domain/enums/video/GetLiveStreamTokenErrorType";
import { IWorkspaceService } from "@/app/services/implementation/WorkspaceService";
import { logger } from "@/infra/logger";
import { IGetLiveStreamTokenUseCase } from "../IGetLiveStreamTokenUseCase";

export class GetLiveStreamTokenUseCase implements IGetLiveStreamTokenUseCase {
	constructor(
		private readonly videoRepository: IVideoRepository,
		private readonly workspaceService: IWorkspaceService
	) {}

	async execute(dto: GetLiveStreamTokenDTO): Promise<
		ResponseDTO & {
			data:
				| GetLiveStreamTokenResponseDTO
				| { error: GetLiveStreamTokenErrorType };
		}
	> {
		const { userId, workspaceId, folderId, spaceId } = dto;

		if (!userId) {
			return {
				success: false,
				data: { error: GetLiveStreamTokenErrorType.INVALID_INPUT },
			};
		}

		logger.debug("Generating live stream token");

		try {
			// Get selected workspace data
			const selectedData = await this.workspaceService.getSelectedWorkspace({
				userId,
				workspaceId,
				folderId,
				spaceId,
			});

			if (!selectedData.selectedWorkspace) {
				return {
					success: false,
					data: { error: GetLiveStreamTokenErrorType.NO_WORKSPACE_SELECTED },
				};
			}

			// Create live stream video
			const newLiveStream = await this.videoRepository.createLiveStream({
				userId,
				workspaceId: selectedData.selectedWorkspace,
				folderId: selectedData.selectedFolder,
				spaceId: selectedData.selectedSpace,
			});

			return {
				success: true,
				data: {
					streamKey: newLiveStream.id,
				},
			};
		} catch (error) {
			logger.error("Error generating live stream token:", error);
			return {
				success: false,
				data: { error: GetLiveStreamTokenErrorType.INTERNAL_ERROR },
			};
		}
	}
}
