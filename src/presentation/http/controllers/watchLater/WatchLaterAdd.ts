import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IWatchLaterAddUseCase } from "@/app/usecases/watchLater/IWatchLaterAddUseCase";
import { WatchLaterAddErrorType } from "@/domain/enums/watchLater/WatchLaterAddErrorType";

export class WatchLaterAddController implements IController {
  constructor(
    private readonly watchLaterAddUseCase: IWatchLaterAddUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.id;
    const { videoId } = httpRequest.body as { videoId?: string };

    const response = await this.watchLaterAddUseCase.execute({ userId, videoId: videoId || "" });

    if (!response.success) {
      const errorType = response.data.error as WatchLaterAddErrorType;
      switch (errorType) {
        case WatchLaterAddErrorType.INVALID_INPUT:
          return new HttpResponse(
            this.httpErrors.error_400().statusCode,
            { message: "Video ID is required" }
          );
        case WatchLaterAddErrorType.VIDEO_NOT_FOUND:
          return new HttpResponse(
            this.httpErrors.error_404().statusCode,
            { message: "Video not found" }
          );
        default:
          return new HttpResponse(
            this.httpErrors.error_500().statusCode,
            { message: "Failed to add video to watch later" }
          );
      }
    }

    const success = this.httpSuccess.success_201(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}