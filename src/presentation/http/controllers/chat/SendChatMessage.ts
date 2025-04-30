import { IController } from "../IController";
import { ISendChatMessageUseCase } from "@/app/usecases/chat/ISendChatMessageUseCase";
import { SendChatMessageErrorType } from "@/domain/enums/chat/SendChatMessageErrorType";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";

export class SendChatMessageController implements IController {
  constructor(
    private readonly sendChatMessageUseCase: ISendChatMessageUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    let error;
    const { videoId, query } = httpRequest.body as { videoId: string; query: string };
    const userId = httpRequest.user.id;

    const response = await this.sendChatMessageUseCase.execute({
      videoId,
      query,
      userId,
    });

    if (!response.success) {
      const errorType = response.data.error as SendChatMessageErrorType;
      switch (errorType) {
        case SendChatMessageErrorType.MISSING_FIELDS:
          error = this.httpErrors.badRequest();
          return new HttpResponse(error.statusCode, { message: errorType });
        case SendChatMessageErrorType.VIDEO_NOT_FOUND:
          error = this.httpErrors.notFound();
          return new HttpResponse(error.statusCode, { message: errorType });
        default:
          error = this.httpErrors.internalServerError();
          return new HttpResponse(error.statusCode, { message: "Internal server error" });
      }
    }

    const success = this.httpSuccess.ok(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}