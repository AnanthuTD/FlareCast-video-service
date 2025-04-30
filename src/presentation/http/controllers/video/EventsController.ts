import { IController } from "../IController";
import { IHttpResponse } from "../../helpers/IHttpResponse";
import { HttpResponse } from "../../helpers/implementations/HttpResponse";
import { HttpRequest } from "../../helpers/implementations/HttpRequest";
import { IEventsUseCase } from "@/app/usecases/video/IEventsUseCase";
import { ISSEService } from "@/app/services/ISSEService";
import { EventsErrorType } from "@/domain/enums/video/EventsErrorType";
import { HttpSuccess } from "../../helpers/implementations/HttpSuccess";
import { HttpErrors } from "../../helpers/implementations/HttpErrors";
import { IHttpErrors } from "../../helpers/IHttpErrors";
import { IHttpSuccess } from "../../helpers/IHttpSuccess";

export class EventsController implements IController {
	constructor(
		private readonly eventsUseCase: IEventsUseCase,
		private readonly sseService: ISSEService,
		private httpErrors: IHttpErrors = new HttpErrors(),
		private httpSuccess: IHttpSuccess = new HttpSuccess()
	) {}

	async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
		const userId = httpRequest.user?.id;
		const { workspaceId } = httpRequest.params as { workspaceId: string };

		const result = await this.eventsUseCase.execute({
			userId,
			workspaceId,
			response,
		});

		if (!result.success) {
			const errorType = result.data.error as EventsErrorType;

			return new HttpResponse(this.httpErrors.badRequest().statusCode, {
				message: errorType,
			});
		}

		// Connection is kept open for SSE; no immediate response body
		return new HttpResponse(this.httpSuccess.ok().statusCode, {});
	}
}
