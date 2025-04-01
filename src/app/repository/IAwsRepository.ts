export interface IAwsRepository {
  copyVideo(sourceVideoId: string, destinationVideoId: string): Promise<void>;
}