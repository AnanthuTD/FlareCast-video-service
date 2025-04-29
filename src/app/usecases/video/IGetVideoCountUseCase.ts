import { ResponseDTO } from "@/domain/dtos/Response";
import { GetVideoCountDTO } from "@/domain/dtos/video/GetVideoCountDTO";
import { GetVideoCountResponseDTO } from "@/domain/dtos/video/GetVideoCountResponseDTO";
import { GetVideoCountErrorType } from "@/domain/enums/video/GetVideoCountErrorType";

export interface IGetVideoCountUseCase {
	execute(dto: GetVideoCountDTO): Promise<
		ResponseDTO & {
			data: GetVideoCountResponseDTO | { error: GetVideoCountErrorType };
		}
	>;
}
