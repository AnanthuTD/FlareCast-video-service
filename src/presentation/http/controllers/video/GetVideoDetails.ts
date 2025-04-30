import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IGetVideoDetailsUseCase } from "@/app/usecases/video/IGetVideoDetailsUseCase";
import { GetVideoDetailsErrorType } from "@/domain/enums/video/GetVideoDetailsErrorType";
import { GetVideoDetailsResponseDTO } from "@/domain/dtos/video/GetVideoDetailsResponseDTO";

export class GetVideoDetailsController implements IController {
	constructor(
		private readonly getVideoDetailsUseCase: IGetVideoDetailsUseCase,
		private httpErrors: IHttpErrors = new HttpErrors(),
		private httpSuccess: IHttpSuccess = new HttpSuccess()
	) {}

	async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
		const userId = httpRequest.user?.id;
		const { videoId } = httpRequest.params as { videoId: string };

		const response = await this.getVideoDetailsUseCase.execute({
			userId,
			videoId,
		});

		if (!response.success) {
			const errorType = response.data.error as GetVideoDetailsErrorType;
			switch (errorType) {
				case GetVideoDetailsErrorType.VIDEO_NOT_FOUND:
					return new HttpResponse(this.httpErrors.notFound().statusCode, {
						message: "Video not found",
						video: null,
					});
				case GetVideoDetailsErrorType.UNAUTHORIZED:
					return new HttpResponse(this.httpErrors.forbidden().statusCode, {
						message: "User don't have access rights to this video",
					});
				case GetVideoDetailsErrorType.PERMISSION_CHECK_FAILED:
					return new HttpResponse(this.httpErrors.internalServerError().statusCode, {
						message: "Failed to check user permission",
					});
				default:
					return new HttpResponse(this.httpErrors.internalServerError().statusCode, {
						message: "Internal server error",
					});
			}
		}

		const success = this.httpSuccess.ok(response.data);
		return new HttpResponse(success.statusCode, success.body);
	}
}
