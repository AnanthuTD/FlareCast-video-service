import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IUpdateVideoDescriptionUseCase } from "@/app/usecases/video/IUpdateVideoDescriptionUseCase";
import { UpdateVideoDescriptionErrorType } from "@/domain/enums/video/UpdateVideoDescriptionErrorType";

export class UpdateVideoDescriptionController implements IController {
  constructor(
    private readonly updateVideoDescriptionUseCase: IUpdateVideoDescriptionUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.id;
    const { videoId } = httpRequest.params as { videoId: string };
    const { description } = httpRequest.body as { description?: string };

    const response = await this.updateVideoDescriptionUseCase.execute({
      userId,
      videoId,
      description: description || "",
    });

    if (!response.success) {
      const errorType = response.data.error as UpdateVideoDescriptionErrorType;
      switch (errorType) {
        case UpdateVideoDescriptionErrorType.INVALID_INPUT:
          return new HttpResponse(
            this.httpErrors.badRequest().statusCode,
            { message: "Video ID and description are required" }
          );
        case UpdateVideoDescriptionErrorType.VIDEO_NOT_FOUND:
          return new HttpResponse(
            this.httpErrors.notFound().statusCode,
            { message: "Video not found or description update failed" }
          );
        case UpdateVideoDescriptionErrorType.UNAUTHORIZED:
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