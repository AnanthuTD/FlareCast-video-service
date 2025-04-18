import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { GetPromotionalVideosErrorType } from "@/domain/enums/promotionalVideo/GetPromotionalVideosErrorType";
import { IGetPromotionalVideosUseCase } from "@/app/usecases/promotionalVideo/IGetPromotionalVideosUseCase";

export class GetPromotionalVideosController implements IController {
  constructor(
    private readonly getPromotionalVideosUseCase: IGetPromotionalVideosUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    let error;
    const { skip = "0", limit = "10" } = httpRequest.query as {
      skip?: string;
      limit?: string;
    };

    const response = await this.getPromotionalVideosUseCase.execute({
      skip: parseInt(skip, 10) || 0,
      limit: parseInt(limit, 10) || 10,
    });

    if (!response.success) {
      const errorType = response.data.error as GetPromotionalVideosErrorType;
      switch (errorType) {
        case GetPromotionalVideosErrorType.INVALID_PAGINATION:
          error = this.httpErrors.error_400();
          return new HttpResponse(error.statusCode, { message: errorType });
        default:
          error = this.httpErrors.error_500();
          return new HttpResponse(error.statusCode, { message: "Internal server error" });
      }
    }

    const success = this.httpSuccess.success_200(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}