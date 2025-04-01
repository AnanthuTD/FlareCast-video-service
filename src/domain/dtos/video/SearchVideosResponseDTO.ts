// src/domain/dtos/video/SearchVideosResponseDTO.ts
import { VideoEntity } from "@/domain/entities/Video";

export interface SearchVideosResponseDTO {
  results: VideoEntity[];
}