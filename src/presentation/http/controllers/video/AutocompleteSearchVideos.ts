import { IController } from "../IController";
import { IAutocompleteSearchVideosUseCase } from "@/app/usecases/video/IAutocompleteSearchVideosUseCase";
import { AutocompleteSearchVideosErrorType } from "@/domain/enums/video/AutocompleteSearchVideosErrorType";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";

export class AutocompleteSearchVideosController implements IController {
  constructor(
    private readonly autocompleteSearchVideosUseCase: IAutocompleteSearchVideosUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    let error;
    const { query, workspaceId, limit = "1", paginationToken = "" } = httpRequest.query as {
      query?: string;
      workspaceId?: string;
      limit?: string;
      paginationToken?: string;
    };

    const response = await this.autocompleteSearchVideosUseCase.execute({
      query: query || "",
      workspaceId: workspaceId || "",
      limit: parseInt(limit, 10) || 1,
      paginationToken,
      direction: "searchAfter",
    });

    if (!response.success) {
      const errorType = response.data.error as AutocompleteSearchVideosErrorType;
      switch (errorType) {
        case AutocompleteSearchVideosErrorType.MISSING_FIELDS:
          error = this.httpErrors.error_400();
          return new HttpResponse(error.statusCode, { results: [] });
        default:
          error = this.httpErrors.error_500();
          return new HttpResponse(error.statusCode, { message: "Internal server error" });
      }
    }

    const success = this.httpSuccess.success_200(response.data);
    return new HttpResponse(success.statusCode, success.body);
  }
}