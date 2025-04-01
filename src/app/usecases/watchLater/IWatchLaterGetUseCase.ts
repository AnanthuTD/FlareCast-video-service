import { ResponseDTO } from "@/domain/dtos/Response";
import { WatchLaterGetDTO } from "@/domain/dtos/watchLater/WatchLaterGetDTO";
import { WatchLaterGetResponseDTO } from "@/domain/dtos/watchLater/WatchLaterGetResponseDTO";
import { WatchLaterGetErrorType } from "@/domain/enums/watchLater/WatchLaterGetErrorType";

export interface IWatchLaterGetUseCase {
  execute(
    dto: WatchLaterGetDTO
  ): Promise<
    ResponseDTO & {
      data: WatchLaterGetResponseDTO | { error: WatchLaterGetErrorType };
    }
  >;
}