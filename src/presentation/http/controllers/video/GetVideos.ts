import { IController } from "../IController";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IGetVideosUseCase } from "@/app/usecases/video/IGetVideosUseCase";
import { GetVideosErrorType } from "@/domain/enums/video/GetVideosErrorType";

export class GetVideosController implements IController {
  constructor(
    private readonly getVideosUseCase: IGetVideosUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    let error;
    const userId = httpRequest.user?.id;
    const { workspaceId } = httpRequest.params as { workspaceId?: string };
    const { skip = "0", limit = "10", folderId = "", spaceId = "" } = httpRequest.query as {
      skip?: string;
      limit?: string;
      folderId?: string;
      spaceId?: string;
    };

    const response = await this.getVideosUseCase.execute({
      userId,
      workspaceId: workspaceId || "",
      skip: parseInt(skip, 10) || 0,
      limit: parseInt(limit, 10) || 10,
      folderId: folderId || undefined,
      spaceId: spaceId || undefined,
    });

    if (!response.success) {
      const errorType = response.data.error as GetVideosErrorType;
      switch (errorType) {
        case GetVideosErrorType.INVALID_INPUT:
          error = this.httpErrors.error_400();
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