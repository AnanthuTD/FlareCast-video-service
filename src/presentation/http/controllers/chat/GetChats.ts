import { IController } from "../IController";
import { IGetChatsUseCase } from "@/app/usecases/chat/IGetChatsUseCase";
import { GetChatsErrorType } from "@/domain/enums/chat/GetChatsErrorType";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";

export class GetChatsController implements IController {
  constructor(
    private readonly getChatsUseCase: IGetChatsUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    let error;
    const { videoId } = httpRequest.params as { videoId: string };
    const { cursor, limit = "10" } = httpRequest.query as { cursor?: string; limit?: string };
    const userId = httpRequest.user.id;

    const response = await this.getChatsUseCase.execute({
      videoId,
      userId,
      cursor,
      limit: parseInt(limit, 10),
    });

    if (!response.success) {
      const errorType = response.data.error as GetChatsErrorType;
      switch (errorType) {
        case GetChatsErrorType.INVALID_LIMIT:
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