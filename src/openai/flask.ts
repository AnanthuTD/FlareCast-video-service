import axios from "axios";
import { readFileSync } from "fs";
import env from "../env";
import { logger } from "../logger/logger";

export async function generateTranscript(inputFilePath: string) {
	try {
		const fileBuffer = readFileSync(inputFilePath);
		const blob = new Blob([fileBuffer]);

		const formData = new FormData();
		formData.append("file", blob, inputFilePath);

		const response = await axios.post(
			env.WHISPER_API,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);

		logger.info("Transcript generated:", response.data);
		return response.data.transcript; // Return the data for use elsewhere
	} catch (error) {
		logger.error("Error generating transcript:", error);     
		throw error; // Re-throw the error to be handled by the caller 
	}
}
