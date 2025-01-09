import fs from "fs/promises";
import path from "path";
import { Storage } from "@google-cloud/storage";
import { createHLS, createMasterPlaylist } from "./ffmpeg/transcode";
import env from "./env";

const BUCKET_NAME = env.GOOGLE_CLOUD_BUCKET_NAME;
const RESOLUTIONS = [480, 720, 1080];

const storage = new Storage({
	keyFilename: env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY,
	projectId: env.GOOGLE_CLOUD_PROJECT_ID,
});
console.log("bucket name: ", BUCKET_NAME);
const bucket = storage.bucket(BUCKET_NAME);

export async function createHLSAndUpload(inputPath: string, outputDir: string, gcsPath: string) {
	try {
		// 1. Create HLS Streams
		await createHLS(inputPath, outputDir);

		// 2. Upload to GCS
		await uploadDirectoryToGCS(outputDir, gcsPath);

		// 3. Create Master Playlist (for Adaptive Bitrate)
		const masterPlaylistContent = createMasterPlaylist(gcsPath, RESOLUTIONS);
		const masterPlaylistPath = path.join(outputDir, "master.m3u8");
		await fs.writeFile(masterPlaylistPath, masterPlaylistContent);
		await bucket.upload(masterPlaylistPath, {
			destination: gcsPath + "/master.m3u8",
		});

		// 4. Cleanup local files (Optional but recommended)
		// await fs.rm(outputDir, { recursive: true, force: true });

		console.log("HLS creation and upload complete!");
	} catch (error) {
		console.error("Error processing HLS and upload:", error);
		throw error;
	}
}

async function uploadDirectoryToGCS(localDir, gcsPath) {
	const files = await fs.readdir(localDir);
	const uploadPromises = files.map(async (file) => {
		const localFilePath = path.join(localDir, file);
		const gcsFilePath = `${gcsPath}/${file}`;
		try {
			await bucket.upload(localFilePath, { destination: gcsFilePath });
			console.log(`Uploaded ${file} to gs://${BUCKET_NAME}/${gcsFilePath}`);
		} catch (error) {
			console.error(`Error uploading ${file}:`, error);
			throw error;
		}
	});
	await Promise.all(uploadPromises);
}
