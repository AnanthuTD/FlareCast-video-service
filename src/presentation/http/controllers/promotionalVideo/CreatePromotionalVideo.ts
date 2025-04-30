import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { ICreatePromotionalVideoUseCase } from "@/app/usecases/promotionalVideo/ICreatePromotionalVideoUseCase";
import { CreatePromotionalVideoErrorType } from "@/domain/enums/promotionalVideo/CreatePromotionalVideoErrorType";
import { VideoCategory } from "@prisma/client";

export class CreatePromotionalVideoController implements IController {
	constructor(
		private readonly createPromotionalVideoUseCase: ICreatePromotionalVideoUseCase,
		private httpErrors: IHttpErrors = new HttpErrors(),
		private httpSuccess: IHttpSuccess = new HttpSuccess()
	) {}

	async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
		let error;
		const { title, description, videoExtension, category } =
			httpRequest.body as {
				title: string;
				description: string;
				videoExtension: string;
				category: VideoCategory;
			};

		const response = await this.createPromotionalVideoUseCase.execute({
			title,
			description,
			videoExtension,
			category,
		});

		if (!response.success) {
			const errorType = response.data.error as CreatePromotionalVideoErrorType;
			switch (errorType) {
				case CreatePromotionalVideoErrorType.INVALID_INPUT:
					error = this.httpErrors.badRequest();
					return new HttpResponse(error.statusCode, { message: errorType });
				default:
					error = this.httpErrors.internalServerError();
					return new HttpResponse(error.statusCode, {
						message: "Internal server error",
					});
			}
		}

		const success = this.httpSuccess.created(response.data);
		return new HttpResponse(success.statusCode, success.body);
	}
}
