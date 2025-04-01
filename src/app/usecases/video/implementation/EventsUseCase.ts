import { ResponseDTO } from "@/domain/dtos/Response";
import { EventsDTO } from "@/domain/dtos/video/EventsDTO";
import { EventsResponseDTO } from "@/domain/dtos/video/EventsResponseDTO";
import { EventsErrorType } from "@/domain/enums/video/EventsErrorType";
import { IEventsUseCase } from "../IEventsUseCase";
import { ISSEService } from "@/app/services/ISSEService";
import { logger } from "@/infra/logger";

export class EventsUseCase implements IEventsUseCase {
  constructor(private readonly sseService: ISSEService) {}

  async execute(
    dto: EventsDTO
  ): Promise<
    ResponseDTO & {
      data: EventsResponseDTO | { error: EventsErrorType };
    }
  > {
    const { userId, workspaceId, response } = dto;

    if (!userId || !workspaceId) {
      return {
        success: false,
        data: { error: EventsErrorType.INVALID_INPUT },
      };
    }

    try {
      // Register the connection
      this.sseService.registerConnection(userId, workspaceId, response);
      logger.debug(`✔️ User ${userId} connected to SSE`);

      // Keep-alive heartbeat
      const keepAlive = setInterval(() => {
        response.write(":\n\n");
        response.flush();
      }, 5000);

      // Handle disconnection
      response.on("close", () => {
        this.sseService.removeConnection(userId, workspaceId);
        clearInterval(keepAlive);
        response.end();
        logger.debug(`✔️ User ${userId} disconnected from SSE`);
      });

      return {
        success: true,
        data: { message: "SSE connection established" },
      };
    } catch (error) {
      logger.error("Error establishing SSE connection:", error);
      return {
        success: false,
        data: { error: EventsErrorType.INTERNAL_ERROR },
      };
    }
  }
}