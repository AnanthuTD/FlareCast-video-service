import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IVideoMoveUseCase } from "@/app/usecases/video/IVideoMoveUseCase";
import { VideoMoveErrorType } from "@/domain/enums/video/VideoMoveErrorType";

export class VideoMoveController implements IController {
	constructor(
		private readonly videoMoveUseCase: IVideoMoveUseCase,
		private httpErrors: IHttpErrors = new HttpErrors(),
		private httpSuccess: IHttpSuccess = new HttpSuccess()
	) {}

	async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
		const userId = httpRequest.user?.id;
		const { videoId } = httpRequest.params as { videoId: string };
		const {
			folderId = "",
			spaceId = "",
			workspaceId = "",
		} = httpRequest.body as {
			folderId?: string;
			workspaceId?: string;
			spaceId?: string;
		};

		const response = await this.videoMoveUseCase.execute({
			userId,
			videoId,
			folderId,
			spaceId,
			workspaceId,
		});

		if (!response.success) {
			const errorType = response.data.error as VideoMoveErrorType;
			switch (errorType) {
				case VideoMoveErrorType.INVALID_INPUT:
					return new HttpResponse(this.httpErrors.badRequest().statusCode, {
						message: "Video ID and Space ID are required",
					});
				case VideoMoveErrorType.VIDEO_NOT_FOUND:
					return new HttpResponse(this.httpErrors.notFound().statusCode, {
						message: "Video not found",
					});
				case VideoMoveErrorType.ALREADY_MOVED:
					return new HttpResponse(this.httpErrors.badRequest().statusCode, {
						message: "Video already shared in this space/folder",
					});
				case VideoMoveErrorType.UNAUTHORIZED:
					return new HttpResponse(this.httpErrors.forbidden().statusCode, {
						message:
							"User does not have permission to share in this space/folder",
					});
				default:
					return new HttpResponse(
						this.httpErrors.internalServerError().statusCode,
						{ message: "Failed to share video" }
					);
			}
		}

		const success = this.httpSuccess.created(response.data);
		return new HttpResponse(success.statusCode, success.body);
	}
}
