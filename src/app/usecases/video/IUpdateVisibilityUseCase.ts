import { UpdateVideoVisibilityDTO } from "@/domain/dtos/video/UpdateVideoVisibilityDTO";
import { IUseCase } from "../IUseCase";
import { UpdateVideoVisibilityResponseDTO } from "@/domain/dtos/video/UpdateVideoVisibilityResponseDTO";

export type IUpdateVideoVisibilityUseCase = IUseCase<
	UpdateVideoVisibilityDTO,
	UpdateVideoVisibilityResponseDTO
>;
