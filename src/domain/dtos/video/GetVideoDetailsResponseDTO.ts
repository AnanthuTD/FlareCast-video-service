import { VideoEntity } from "@/domain/entities/Video";

export interface GetVideoDetailsResponseDTO {
  video: VideoEntity & { watchLater: { id: string } | null };
}