export interface IChatAIService {
  queryTranscript(
    videoId: string,
    userId: string,
    sessionId: string,
    userQuery: string
  ): Promise<string>;
}