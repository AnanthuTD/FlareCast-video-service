import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IOnSuccessUseCase } from "@/app/usecases/video/IOnSuccessUseCase";
import { OnSuccessErrorType } from "@/domain/enums/video/OnSuccessErrorType";

export class VideoEditSuccessController implements IController {
  constructor(
    private readonly onSuccessUseCase: IOnSuccessUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.id;
    const { videoId } = httpRequest.params as { videoId: string };
    const { key, status } = httpRequest.body as { key?: string; status?: string };

    const response = await this.onSuccessUseCase.execute({
      userId,
      videoId,
      key: key || "",
      status: status || "",
    });

    if (!response.success) {
      const errorType = response.data.error as OnSuccessErrorType;
      switch (errorType) {
        case OnSuccessErrorType.INVALID_INPUT:
          return new HttpResponse(
            this.httpErrors.error_400().statusCode,
            { error: "Video ID and key are required" }
          );
        default:
          return new HttpResponse(
            this.httpErrors.error_500().statusCode,
            { message: "Internal server error" }
          );
      }
    }

    const success = this.httpSuccess.success_200(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}