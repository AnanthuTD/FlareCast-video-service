import prisma from "../prismaClient";
import { generateTranscript } from "./flask";
import { generateSummaryAndTitle } from "../gemini/generateSummary";

export const processVideo = async (inputVideo: string, videoId: string) => {
	try {
		console.log('⚙️ Generating video transcriptions...')
		const transcription = await generateTranscript(inputVideo);
		console.log('⚙️ Generating video transcriptions success ✅')

		if (transcription) {
			console.log('⚙️ Generating summary and title...')
			const result = await generateSummaryAndTitle(transcription);
			if (result) {
				console.log(result.title); 
				console.log(result.summary); 

				console.log("✅ Generated Title and Summary:", result);

				await prisma.video.update({
					where: { id: videoId },
					data: {
						title: result.title,
						description: result.summary,
						transcription: transcription,
					},
				});
			} else {
				console.error("🔴 Failed to generate title and summary.");
			}
		} else {
			console.error("🔴 Failed to transcribe audio.");
		}
	} catch (error) {
		console.error("🔴 Error processing video:", error);
	}
};
