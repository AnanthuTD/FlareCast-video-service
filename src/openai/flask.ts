import axios from "axios";
import { readFileSync } from "fs";

export async function generateTranscript(inputFilePath: string) {
	try {
		const fileBuffer = readFileSync(inputFilePath);
		const blob = new Blob([fileBuffer]);

		const formData = new FormData();
		formData.append("file", blob, inputFilePath);

		const response = await axios.post(
			"http://127.0.0.1:5000/transcribe",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);

		console.log("Transcript generated:", response.data);
		return response.data.transcript; // Return the data for use elsewhere
	} catch (error) {
		console.error("Error generating transcript:", error);     
		throw error; // Re-throw the error to be handled by the caller 
	}
}
