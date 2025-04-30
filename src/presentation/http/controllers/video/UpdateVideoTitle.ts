import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IUpdateVideoTitleUseCase } from "@/app/usecases/video/IUpdateVideoTitleUseCase";
import { UpdateVideoTitleErrorType } from "@/domain/enums/video/UpdateVideoTitleErrorType";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";

export class UpdateVideoTitleController implements IController {
  constructor(
    private readonly updateVideoTitleUseCase: IUpdateVideoTitleUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.id;
    const { videoId } = httpRequest.params as { videoId: string };
    const { title } = httpRequest.body as { title?: string };

    const response = await this.updateVideoTitleUseCase.execute({
      userId,
      videoId,
      title: title || "",
    });

    if (!response.success) {
      const errorType = response.data.error as UpdateVideoTitleErrorType;
      switch (errorType) {
        case UpdateVideoTitleErrorType.INVALID_INPUT:
          return new HttpResponse(
            this.httpErrors.badRequest().statusCode,
            { message: "Video ID and title are required" }
          );
        case UpdateVideoTitleErrorType.VIDEO_NOT_FOUND:
          return new HttpResponse(
            this.httpErrors.notFound().statusCode,
            { message: "Video not found or title update failed" }
          );
        case UpdateVideoTitleErrorType.UNAUTHORIZED:
          return new HttpResponse(
            this.httpErrors.forbidden().statusCode,
            { message: "User does not have permission to edit this video" }
          );
        default:
          return new HttpResponse(
            this.httpErrors.internalServerError().statusCode,
            { message: "Internal server error" }
          );
      }
    }

    const success = this.httpSuccess.ok(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}