import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IWatchLaterGetUseCase } from "@/app/usecases/watchLater/IWatchLaterGetUseCase";
import { WatchLaterGetErrorType } from "@/domain/enums/watchLater/WatchLaterGetErrorType";

export class WatchLaterGetController implements IController {
  constructor(
    private readonly watchLaterGetUseCase: IWatchLaterGetUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.id;
    const { workspaceId, page = "1", limit = "10" } = httpRequest.query as {
      workspaceId?: string;
      page?: string;
      limit?: string;
    };

    const response = await this.watchLaterGetUseCase.execute({
      userId,
      workspaceId: workspaceId || "",
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    if (!response.success) {
      const errorType = response.data.error as WatchLaterGetErrorType;
      switch (errorType) {
        case WatchLaterGetErrorType.INVALID_INPUT:
          return new HttpResponse(
            this.httpErrors.error_400().statusCode,
            { message: "Workspace ID is required or pagination parameters are invalid" }
          );
        default:
          return new HttpResponse(
            this.httpErrors.error_500().statusCode,
            { message: "Failed to get watch later videos" }
          );
      }
    }

    const success = this.httpSuccess.success_200(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}