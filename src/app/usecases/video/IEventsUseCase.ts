import { ResponseDTO } from "@/domain/dtos/Response";
import { EventsDTO } from "@/domain/dtos/video/EventsDTO";
import { EventsResponseDTO } from "@/domain/dtos/video/EventsResponseDTO";
import { EventsErrorType } from "@/domain/enums/video/EventsErrorType";

export interface IEventsUseCase {
  execute(
    dto: EventsDTO
  ): Promise<
    ResponseDTO & {
      data: EventsResponseDTO | { error: EventsErrorType };
    }
  >;
}