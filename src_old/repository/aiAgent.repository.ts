import env from "../env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../prismaClient";
import { logger } from "../logger/logger";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Fetch transcript and query Gemini with context
async function queryTranscript(
	videoId: string,
	userId: string,
	sessionId: string,
	userQuery: string
) {
	try {
		// Fetch video from database
		const video = await prisma.video.findUnique({
			where: { id: videoId },
			select: { transcription: true, title: true },
		});

		if (!video || !video.transcription) {
			logger.error(`Video or transcription not found for videoId: ${videoId}`);
			throw new Error("Video or transcription not found");
		}

		const transcript = video.transcription;

		// Get conversation history for this user and video from the database
		const history = await prisma.chat.findMany({
			where: {
				sessionId,
			},
			orderBy: { createdAt: "asc" },
			take: 5,
			select: {
				message: true,
				userId: true,
				repliedTo: { select: { message: true, userId: true } },
			},
		});

		const formattedHistory = history
			.map((chat) => ({
				query: chat.repliedTo?.message || chat.message,
				answer: chat.userId === "ai" ? chat.message : null,
			}))
			.filter((entry) => entry.query && entry.answer);

		// Build prompt with transcript and conversation history
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

		// Note: History is now managed by the caller (e.g., the route), not here
		return answer;
	} catch (error) {
		logger.error("Error querying Gemini:", (error as Error).message);
		throw error; // Propagate the error for the caller to handle
	}
}

// Example usage (for testing)
async function test() {
	try {
		const response = await queryTranscript(
			"some_video_id",
			"test_session_123",
			"What did they say about climate change?"
		);
		console.log("Response:", response);
	} catch (error) {
		console.error("Test failed:", error);
	}
}

export default queryTranscript;
