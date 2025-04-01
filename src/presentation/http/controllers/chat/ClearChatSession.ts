import { IController } from "../IController";
import { IClearChatSessionUseCase } from "@/app/usecases/chat/IClearChatSessionUseCase";
import { ClearChatSessionErrorType } from "@/domain/enums/chat/ClearChatSessionErrorType";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";

export class ClearChatSessionController implements IController {
  constructor(
    private readonly clearChatSessionUseCase: IClearChatSessionUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    let error;
    const { videoId, sessionId } = httpRequest.body as { videoId: string; sessionId: string };
    const userId = httpRequest.user.id;

    const response = await this.clearChatSessionUseCase.execute({
      videoId,
      sessionId,
      userId,
    });

    if (!response.success) {
      const errorType = response.data.error as ClearChatSessionErrorType;
      switch (errorType) {
        case ClearChatSessionErrorType.MISSING_FIELDS:
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