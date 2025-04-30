import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IVideoShareUseCase } from "@/app/usecases/video/IVideoShareUseCase";
import { VideoShareErrorType } from "@/domain/enums/video/VideoShareErrorType";

export class VideoShareController implements IController {
  constructor(
    private readonly videoShareUseCase: IVideoShareUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.id;
    const { videoId } = httpRequest.params as { videoId: string };
    const { spaceId = "", folderId = "" } = httpRequest.body as { spaceId?: string; folderId?: string };

    const response = await this.videoShareUseCase.execute({
      userId,
      videoId,
      spaceId,
      folderId,
    });

    if (!response.success) {
      const errorType = response.data.error as VideoShareErrorType;
      switch (errorType) {
        case VideoShareErrorType.INVALID_INPUT:
          return new HttpResponse(
            this.httpErrors.badRequest().statusCode,
            { message: "Video ID and Space ID are required" }
          );
        case VideoShareErrorType.VIDEO_NOT_FOUND:
          return new HttpResponse(
            this.httpErrors.notFound().statusCode,
            { message: "Video not found" }
          );
        case VideoShareErrorType.ALREADY_SHARED:
          return new HttpResponse(
            this.httpErrors.badRequest().statusCode,
            { message: "Video already shared in this space/folder" }
          );
        case VideoShareErrorType.UNAUTHORIZED:
          return new HttpResponse(
            this.httpErrors.forbidden().statusCode,
            { message: "User does not have permission to share in this space/folder" }
          );
        default:
          return new HttpResponse(
            this.httpErrors.internalServerError().statusCode,
            { message: "Failed to share video" }
          );
      }
    }

    const success = this.httpSuccess.created(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}