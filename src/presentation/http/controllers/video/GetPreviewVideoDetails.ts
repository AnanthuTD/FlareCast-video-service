import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { GetPreviewVideoDetailsErrorType } from "@/domain/enums/video/GetPreviewVideoDetailsErrorType";
import { IGetPreviewVideoDetailsUseCase } from "@/app/usecases/video/IGetPreviewVideoDetailsUseCase";

export class GetPreviewVideoDetailsController implements IController {
  constructor(
    private readonly getPreviewVideoDetailsUseCase: IGetPreviewVideoDetailsUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    const { videoId } = httpRequest.params as { videoId: string };

    const response = await this.getPreviewVideoDetailsUseCase.execute({ videoId });

    if (!response.success) {
      const errorType = response.data.error as GetPreviewVideoDetailsErrorType;
      switch (errorType) {
        case GetPreviewVideoDetailsErrorType.VIDEO_NOT_FOUND:
          return new HttpResponse(
            this.httpErrors.notFound().statusCode,
            { message: "Video not found", video: null }
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