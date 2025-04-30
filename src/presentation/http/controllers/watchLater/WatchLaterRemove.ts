import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IWatchLaterRemoveUseCase } from "@/app/usecases/watchLater/IWatchLaterRemoveUseCase";
import { WatchLaterRemoveErrorType } from "@/domain/enums/watchLater/WatchLaterRemoveErrorType";

export class WatchLaterRemoveController implements IController {
	constructor(
		private readonly watchLaterRemoveUseCase: IWatchLaterRemoveUseCase,
		private httpErrors: IHttpErrors = new HttpErrors(),
		private httpSuccess: IHttpSuccess = new HttpSuccess()
	) {}

	async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
		const userId = httpRequest.user?.id;
		const { videoId } = httpRequest.params as { videoId: string };

		const response = await this.watchLaterRemoveUseCase.execute({
			userId,
			videoId,
		});

		if (!response.success) {
			const errorType = response.data.error as WatchLaterRemoveErrorType;
			switch (errorType) {
				case WatchLaterRemoveErrorType.INVALID_INPUT:
					return new HttpResponse(this.httpErrors.badRequest().statusCode, {
						message: "Video ID is required",
					});
				case WatchLaterRemoveErrorType.VIDEO_NOT_FOUND:
					return new HttpResponse(this.httpErrors.notFound().statusCode, {
						message: "Video not found",
					});
				default:
					return new HttpResponse(this.httpErrors.internalServerError().statusCode, {
						message: "Failed to remove video from watch later",
					});
			}
		}

		const success = this.httpSuccess.ok(response.data);
		return new HttpResponse(success.statusCode, success.body);
	}
}
