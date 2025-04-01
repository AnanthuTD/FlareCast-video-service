// src/domain/dtos/video/AutocompleteSearchVideosResponseDTO.ts
import { VideoSuggestion } from "@/app/repository/IVideoRepository";

export interface AutocompleteSearchVideosResponseDTO {
  results: VideoSuggestion[];
}