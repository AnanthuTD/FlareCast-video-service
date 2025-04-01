import { ResponseDTO } from "@/domain/dtos/Response";
import { WatchLaterRemoveDTO } from "@/domain/dtos/watchLater/WatchLaterRemoveDTO";
import { WatchLaterRemoveResponseDTO } from "@/domain/dtos/watchLater/WatchLaterRemoveResponseDTO";
import { WatchLaterRemoveErrorType } from "@/domain/enums/watchLater/WatchLaterRemoveErrorType";

export interface IWatchLaterRemoveUseCase {
  execute(
    dto: WatchLaterRemoveDTO
  ): Promise<
    ResponseDTO & {
      data: WatchLaterRemoveResponseDTO | { error: WatchLaterRemoveErrorType };
    }
  >;
}