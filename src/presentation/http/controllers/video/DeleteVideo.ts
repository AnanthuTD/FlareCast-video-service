import { IController } from "../IController";
import { IDeleteVideoUseCase } from "@/app/usecases/video/IDeleteVideoUseCase";
import { DeleteVideoErrorType } from "@/domain/enums/video/DeleteVideoErrorType";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";

export class DeleteVideoController implements IController {
  constructor(
    private readonly deleteVideoUseCase: IDeleteVideoUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    let error;
    const { videoId } = httpRequest.params as { videoId: string };
    const userId = httpRequest.user?.id;

    const response = await this.deleteVideoUseCase.execute({
      videoId,
      userId,
    });

    if (!response.success) {
      const errorType = response.data.error as DeleteVideoErrorType;
      switch (errorType) {
        case DeleteVideoErrorType.VIDEO_NOT_FOUND:
          error = this.httpErrors.error_404();
          return new HttpResponse(error.statusCode, { message: errorType });
        case DeleteVideoErrorType.UNAUTHORIZED:
          error = this.httpErrors.error_403();
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