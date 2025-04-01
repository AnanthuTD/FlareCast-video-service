import { GoogleGenerativeAI } from "@google/generative-ai";
import { IVideoRepository } from "@/app/repository/IVideoRepository";
import { IChatRepository } from "@/app/repository/IChatRepository";
import { logger } from "@/infra/logger";
import env from "@/infra/env";
import { IChatAIService } from "../IChatService";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export class ChatAIService implements IChatAIService {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly chatRepository: IChatRepository
  ) {}

  async queryTranscript(
    videoId: string,
    userId: string,
    sessionId: string,
    userQuery: string
  ): Promise<string> {
    // Fetch video data
    const video = await this.videoRepository.findById(videoId);
    if (!video || !video.transcription) {
      logger.error(`Video or transcription not found for videoId: ${videoId}`);
      throw new Error("Video or transcription not found");
    }

    const transcript = video.transcription;

    // Fetch conversation history
    const history = await this.chatRepository.findChatHistoryBySession(sessionId);
    const formattedHistory = history
      .map((chat) => ({
        query: chat.repliedTo?.message || chat.message,
        answer: chat.userId === null ? chat.message : null, // Assuming AI has no userId
      }))
      .filter((entry) => entry.query && entry.answer);

    // Build prompt
    let prompt = `
      You are an AI agent that answers questions based solely on the provided video transcript.
      Do not use external knowledge unless explicitly instructed. Here is the transcript:
      
      "${transcript}"
      
      Below is the conversation history (if any):
    `;

    if (formattedHistory.length > 0) {
      prompt += "\nConversation History:\n";
      formattedHistory.forEach(({ query, answer }, index) => {
        prompt += `Q${index + 1}: "${query}"\nA${index + 1}: "${answer}"\n`;
      });
    }

    prompt += `\nUser question: "${userQuery}"\nProvide a concise and accurate response based only on the transcript, considering the conversation history if relevant.`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    if (!result || !result.response || !result.response.text) {
      logger.error("🔴 Unexpected API response:", result);
      throw new Error("Invalid response from Gemini API");
    }

    const answer = result.response.text();
    logger.info("Raw response: ", answer);
    return answer;
  }
}