import path from "path";
import { createHLSAndUpload } from "../aws/uploadToS3";
import { createThumbnails } from "../createThumbnails";
import { processVideo } from "../openai/processVideo";

export class VideoProcessingService {
	static async processVideoFile(fileName: string, videoId: string) {
		const inputVideo = path.join(process.cwd(), "temp_upload", fileName);
		const outputDirectory = path.join(process.cwd(), `hls-output/${videoId}`);
		const gcsPath = videoId;

		try {
			await createHLSAndUpload(inputVideo, outputDirectory, gcsPath);
			createThumbnails(
				inputVideo,
				path.join(outputDirectory, "thumbnails"),
				gcsPath,
				videoId
			);

			// TODO: Fetch user plan from user_service before processing.
			if (true) await processVideo(inputVideo, videoId);
		} catch (error) {
			throw new Error(`HLS processing failed: ${(error as Error).message}`);
		}
	}
}
