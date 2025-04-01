import { IController } from "../IController";
import { IUpdateVideoVisibilityUseCase } from "@/app/usecases/video/IUpdateVisibilityUseCase";
import { UpdateVideoVisibilityErrorType } from "@/domain/enums/video/UpdateVideoVisibilityErrorType";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";

export class UpdateVideoVisibilityController implements IController {
	constructor(
		private readonly updateVideoVisibilityUseCase: IUpdateVideoVisibilityUseCase,
		private httpErrors: IHttpErrors = new HttpErrors(),
		private httpSuccess: IHttpSuccess = new HttpSuccess()
	) {}

	async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
		let error;
		const { videoId } = httpRequest.params as { videoId: string };
		const { visibility } = httpRequest.body as { visibility: boolean };

		// const userId = httpRequest.user.id;

		const response = await this.updateVideoVisibilityUseCase.execute({
			id: videoId,
			visibility,
		});

		if (!response.success) {
			const errorType = response.data.error as UpdateVideoVisibilityErrorType;
			switch (errorType) {
				case UpdateVideoVisibilityErrorType.VIDEO_NOT_FOUND:
					error = this.httpErrors.error_404();
					return new HttpResponse(error.statusCode, {
						message: errorType,
					});
				default:
					error = this.httpErrors.error_500();
					return new HttpResponse(error.statusCode, {
						message: "Internal server error",
					});
			}
		}

		const success = this.httpSuccess.success_200(response.data);
		return new HttpResponse(success.statusCode, success.body);
	}
}
