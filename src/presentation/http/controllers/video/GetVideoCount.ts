import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IGetVideoCountUseCase } from "@/app/usecases/video/IGetVideoCountUseCase";
import { GetVideoCountErrorType } from "@/domain/enums/video/GetVideoCountErrorType";

export class GetVideoCountController implements IController {
	constructor(
		private readonly getVideoCountUseCase: IGetVideoCountUseCase,
		private httpErrors: IHttpErrors = new HttpErrors(),
		private httpSuccess: IHttpSuccess = new HttpSuccess()
	) {}

	async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
		const userId = httpRequest.user?.id!;
		const { folderId, spaceId, workspaceId } = httpRequest.query as {
			[key: string]: string;
		};

		if (!folderId && !spaceId && !workspaceId) {
			return new HttpResponse(this.httpErrors.badRequest().statusCode, {
				message: "Any of the given is needed - folderId, spaceId, workspaceId",
				count: 0,
			});
		}

		const response = await this.getVideoCountUseCase.execute({
			userId,
			folderId,
			spaceId,
			workspaceId,
		});

		if (!response.success) {
			const errorType = response.data.error as GetVideoCountErrorType;
			switch (errorType) {
				case GetVideoCountErrorType.INSUFFICIENT_DATA:
					return new HttpResponse(this.httpErrors.badRequest().statusCode, {
						message:
							"Any of the given is needed - folderId, spaceId, workspaceId",
						count: 0,
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
