import { ResponseDTO } from "@/domain/dtos/Response";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import env from "@/infra/env";
import { IGetPromotionalVideosUseCase } from "../IGetPromotionalVideosUseCase";
import { GetPromotionalVideosDTO } from "@/domain/dtos/promotionalVideo/GetPromotionalVideosDTO";
import { GetPromotionalVideosResponseDTO } from "@/domain/dtos/promotionalVideo/GetPromotionalVideosResponseDTO";
import { GetPromotionalVideosErrorType } from "@/domain/enums/promotionalVideo/GetPromotionalVideosErrorType";
import { getTimeAgo, getVideoDurationFormatted } from "@/app/utility/timeUtils";

export class GetPromotionalVideosUseCase
	implements IGetPromotionalVideosUseCase
{
	constructor(private readonly videoRepository: IVideoRepository) {}

	async execute(dto: GetPromotionalVideosDTO): Promise<
		ResponseDTO & {
			data:
				| GetPromotionalVideosResponseDTO
				| { error: GetPromotionalVideosErrorType };
		}
	> {
		const { skip, limit, category, role } = dto;

		const skipNum = Math.max(skip, 0);
		const limitNum = Math.max(limit, 1);

		console.log("role = ", role);

		try {
			const videos = await this.videoRepository.findPromotionalVideos(
				skipNum,
				limitNum,
				category,
				role === "user"
			);

			console.log(videos);

			const videosWithThumbnail = videos.map((v) => ({
				...v.toObject(),
				id: v.id,
				totalViews: v.totalViews ?? 0,
				uniqueViews: v.uniqueViews ?? 0,
				duration: getVideoDurationFormatted(v.duration),
				createdAt: v.createdAt,
				thumbnailUrl: `${env.AWS_CLOUDFRONT_URL}/${v.id}/thumbnails/thumb00001.jpg`,
				views: v.totalViews ?? 0,
				timeAgo: getTimeAgo(v.createdAt),
				userAvatarUrl: null,
				category,
			}));

			// Calculate pagination metadata
			const totalCount = await this.videoRepository.countPromotionalVideos({
				category,
				isPublic: role === "user",
			});
			const totalPages = Math.ceil(totalCount / limitNum);
			const hasNextPage = skipNum + videos.length < totalCount;
			const hasPrevPage = skipNum > 0;

			return {
				success: true,
				data: {
					videos: videosWithThumbnail,
					totalCount,
					page: Math.floor(skipNum / limitNum) + 1,
					pageSize: limitNum,
					totalPages,
					hasNextPage,
					hasPrevPage,
				},
			};
		} catch (error) {
			console.log(error);
			return {
				success: false,
				data: { error: GetPromotionalVideosErrorType.INTERNAL_ERROR },
			};
		}
	}
}
