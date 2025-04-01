import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IGeneratePresignedUrlUseCase } from "@/app/usecases/video/IGeneratePresignedUrlUseCase";
import { GeneratePresignedUrlErrorType } from "@/domain/enums/video/GeneratePresignedUrlErrorType";

export class GeneratePresignedUrlController implements IController {
	constructor(
		private readonly generatePresignedUrlUseCase: IGeneratePresignedUrlUseCase,
		private httpErrors: IHttpErrors = new HttpErrors(),
		private httpSuccess: IHttpSuccess = new HttpSuccess()
	) {}

	async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
		const userId = httpRequest.user?.id;
		const { videoId } = httpRequest.query as { videoId?: string };

		const response = await this.generatePresignedUrlUseCase.execute({
			userId,
			videoId: videoId || "",
		});

		if (!response.success) {
			const errorType = response.data.error as GeneratePresignedUrlErrorType;
			switch (errorType) {
				case GeneratePresignedUrlErrorType.INVALID_INPUT:
					return new HttpResponse(this.httpErrors.error_400().statusCode, {
						error: "Video ID is required",
					});
				case GeneratePresignedUrlErrorType.VIDEO_NOT_FOUND:
					return new HttpResponse(this.httpErrors.error_404().statusCode, {
						message: "Video not found",
					});
				case GeneratePresignedUrlErrorType.UNAUTHORIZED:
					return new HttpResponse(this.httpErrors.error_403().statusCode, {
						message: "User does not have permission to edit this video",
					});
				default:
					return new HttpResponse(this.httpErrors.error_500().statusCode, {
						error: "Failed to generate presigned URL",
					});
			}
		}

		const success = this.httpSuccess.success_200(response.data);
		return new HttpResponse(success.statusCode, success.body);
	}
}
