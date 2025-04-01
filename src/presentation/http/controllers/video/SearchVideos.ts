import { IController } from "../IController";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { ISearchVideosUseCase } from "@/app/usecases/video/ISearchVideosUseCase";
import { SearchVideosErrorType } from "@/domain/enums/video/SearchVideosErrorType";

export class SearchVideosController implements IController {
  constructor(
    private readonly searchVideosUseCase: ISearchVideosUseCase,
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    const { query, paginationToken, workspaceId, limit = "1" } = httpRequest.query as {
      query?: string;
      paginationToken?: string;
      workspaceId?: string;
      limit?: string;
    };

    const response = await this.searchVideosUseCase.execute({
      query: query || "",
      paginationToken,
      workspaceId: workspaceId || "",
      limit: parseInt(limit) || 1,
    });

    if (!response.success) {
      const errorType = response.data.error as SearchVideosErrorType;
      if (errorType === SearchVideosErrorType.INVALID_INPUT) {
        return new HttpResponse(200, { results: [] }); // Mimics original behavior
      }
      return new HttpResponse(500, { message: "Internal server error" });
    }

    const success = this.httpSuccess.success_200(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}