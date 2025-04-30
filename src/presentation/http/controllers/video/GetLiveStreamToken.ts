import { IController } from "../IController";
import { IGetLiveStreamTokenUseCase } from "@/app/usecases/video/IGetLiveStreamTokenUseCase";
import { GetLiveStreamTokenErrorType } from "@/domain/enums/video/GetLiveStreamTokenErrorType";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";

export class GetLiveStreamTokenController implements IController {
  constructor(
    private readonly getLiveStreamTokenUseCase: IGetLiveStreamTokenUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    let error;
    const userId = httpRequest.user?.id;
    const { workspaceId, folderId, spaceId } = httpRequest.query as {
      workspaceId?: string;
      folderId?: string;
      spaceId?: string;
    };

    const response = await this.getLiveStreamTokenUseCase.execute({
      userId,
      workspaceId,
      folderId,
      spaceId,
    });

    if (!response.success) {
      const errorType = response.data.error as GetLiveStreamTokenErrorType;
      switch (errorType) {
        case GetLiveStreamTokenErrorType.NO_WORKSPACE_SELECTED:
          error = this.httpErrors.notFound();
          return new HttpResponse(error.statusCode, { error: errorType });
        case GetLiveStreamTokenErrorType.INVALID_INPUT:
          error = this.httpErrors.badRequest();
          return new HttpResponse(error.statusCode, { error: errorType });
        default:
          error = this.httpErrors.internalServerError();
          return new HttpResponse(error.statusCode, { message: "Internal server error" });
      }
    }

    console.log(response.data)

    const success = this.httpSuccess.ok(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}