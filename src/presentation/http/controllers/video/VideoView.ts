import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IVideoViewUseCase } from "@/app/usecases/video/IVideoViewUseCase";
import { VideoViewErrorType } from "@/domain/enums/video/VideoViewErrorType";

export class VideoViewController implements IController {
  constructor(
    private readonly videoViewUseCase: IVideoViewUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.id;
    const { videoId } = httpRequest.params as { videoId: string };

    const response = await this.videoViewUseCase.execute({ userId, videoId });

    if (!response.success) {
      const errorType = response.data.error as VideoViewErrorType;
      switch (errorType) {
        case VideoViewErrorType.INVALID_INPUT:
          return new HttpResponse(
            this.httpErrors.badRequest().statusCode,
            { message: "Video ID and user ID are required" }
          );
        default:
          return new HttpResponse(
            this.httpErrors.internalServerError().statusCode,
            { message: "Failed to process video view" }
          );
      }
    }

    const success = this.httpSuccess.accepted(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}