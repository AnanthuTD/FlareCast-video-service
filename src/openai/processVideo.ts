import prisma from "../prismaClient";
// import { generateTranscript } from "./flask";
import { generateSummaryAndTitle } from "../gemini/generateSummary";
import { generateTranscript } from "../huggingface";
import { logger } from "../logger/logger";

export const processVideo = async (inputVideo: string, videoId: string) => {
	try {
		logger.info('⚙️ Generating video transcriptions...')
		const transcription = await generateTranscript(inputVideo);
		logger.info('⚙️ Generating video transcriptions success ✅')

		if (transcription) {
			logger.info('⚙️ Generating summary and title...')
			const result = await generateSummaryAndTitle(transcription);
			if (result) {
				logger.info(result.title); 
				logger.info(result.summary); 

				logger.info("✅ Generated Title and Summary:", result);

				await prisma.video.update({
					where: { id: videoId },
					data: {
						title: result.title,
						description: result.summary,
						transcription: transcription,
					},
				});
			} else {
				logger.error("🔴 Failed to generate title and summary.");
			}
		} else {
			logger.error("🔴 Failed to transcribe audio.");
		}
	} catch (error) {
		logger.error("🔴 Error processing video:", error);
	}
};
