import { GetLiveStreamTokenDTO } from "@/domain/dtos/video/GetLiveStreamTokenDTO";
import { GetLiveStreamTokenResponseDTO } from "@/domain/dtos/video/GetLiveStreamTokenResponseDTO";
import { ResponseDTO } from "@/domain/dtos/Response";
import { GetLiveStreamTokenErrorType } from "@/domain/enums/video/GetLiveStreamTokenErrorType";

export interface IGetLiveStreamTokenUseCase {
  execute(
    dto: GetLiveStreamTokenDTO
  ): Promise<
    ResponseDTO & {
      data: GetLiveStreamTokenResponseDTO | { error: GetLiveStreamTokenErrorType };
    }
  >;
}