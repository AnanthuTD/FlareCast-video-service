import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IVisibilityUseCase } from "@/app/usecases/video/IVisibilityUseCase";
import { VisibilityErrorType } from "@/domain/enums/video/VisibilityErrorType";

export class VisibilityController implements IController {
  constructor(
    private readonly visibilityUseCase: IVisibilityUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.id;
    const { videoId } = httpRequest.params as { videoId: string };
    const { isPublic } = httpRequest.body as { isPublic: boolean };

    const response = await this.visibilityUseCase.execute({ userId, videoId, isPublic });

    if (!response.success) {
      const errorType = response.data.error as VisibilityErrorType;
      switch (errorType) {
        case VisibilityErrorType.INVALID_INPUT:
          return new HttpResponse(
            this.httpErrors.error_400().statusCode,
            { message: "Video ID and isPublic are required" }
          );
        case VisibilityErrorType.VIDEO_NOT_FOUND:
          return new HttpResponse(
            this.httpErrors.error_404().statusCode,
            { message: "Video not found" }
          );
        default:
          return new HttpResponse(
            this.httpErrors.error_500().statusCode,
            { message: "Failed to update visibility" }
          );
      }
    }

    const success = this.httpSuccess.success_200(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}