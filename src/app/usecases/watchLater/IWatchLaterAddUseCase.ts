import { ResponseDTO } from "@/domain/dtos/Response";
import { WatchLaterAddDTO } from "@/domain/dtos/watchLater/WatchLaterAddDTO";
import { WatchLaterAddResponseDTO } from "@/domain/dtos/watchLater/WatchLaterAddResponseDTO";
import { WatchLaterAddErrorType } from "@/domain/enums/watchLater/WatchLaterAddErrorType";

export interface IWatchLaterAddUseCase {
  execute(
    dto: WatchLaterAddDTO
  ): Promise<
    ResponseDTO & {
      data: WatchLaterAddResponseDTO | { error: WatchLaterAddErrorType };
    }
  >;
}