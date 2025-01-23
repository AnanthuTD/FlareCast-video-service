import env from "./env";
import fs from 'fs'
import { logger } from "./logger/logger";

export async function generateTranscript(filePath: string): Promise<object> {
	const data = fs.readFileSync(filePath);
	const response = await fetch(
		"https://api-inference.huggingface.co/models/openai/whisper-tiny",
		{
			headers: {
				Authorization: `Bearer ${env.HUGGINGFACE_TOKEN}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: data,
		}
	);
	const result = await response.json();
	logger.info("transcript: ",result)
	return result.text || '';
}
