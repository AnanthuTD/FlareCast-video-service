import fs from "fs/promises";
import path from "path";
import { Storage, StorageOptions } from "@google-cloud/storage";
import { createHLS, createMasterPlaylist } from "./ffmpeg/transcode";
import env from "./env";
import { existsSync } from "fs";
import { logger } from "./logger/logger";

const BUCKET_NAME = env.GOOGLE_CLOUD_BUCKET_NAME;
const RESOLUTIONS = [480, 720];

const { GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_FILE, GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY, GOOGLE_CLOUD_PROJECT_ID } = process.env;

if (!GOOGLE_CLOUD_PROJECT_ID) {
    throw new Error('GOOGLE_CLOUD_PROJECT_ID is not set in environment variables.');
}

let storageConfig: StorageOptions = { projectId: GOOGLE_CLOUD_PROJECT_ID };

if (GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_FILE && existsSync(GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_FILE)) {
    // Use the key file if it exists
    storageConfig.keyFilename = GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_FILE;
    logger.info('Using service account key file for authentication.');
} else if (GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY) {
    // Fall back to inline credentials if the file isn't available
    storageConfig.credentials = JSON.parse(GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY);
    logger.info('Using inline service account credentials for authentication.');
} else {
    throw new Error('Neither GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_FILE nor GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY is available.');
}

// Initialize the Storage instance
const storage = new Storage(storageConfig);

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

		logger.info("🟢 HLS creation and upload complete!");
	} catch (error) {
		logger.error("🔴 Error processing HLS and upload:", error);
		throw error;
	}
}

export async function uploadDirectoryToGCS(localDir: string, gcsPath: string) {
	const files = await fs.readdir(localDir);
	const uploadPromises = files.map(async (file) => {
		const localFilePath = path.join(localDir, file);
		const gcsFilePath = `${gcsPath}/${file}`;
		try {
			await bucket.upload(localFilePath, { destination: gcsFilePath });
			logger.info(`🟢 Uploaded ${file} to gs://${BUCKET_NAME}/${gcsFilePath}`);
		} catch (error) {
			logger.error(`🔴 Error uploading ${file}:`, error);
			throw error;
		}
	});
	await Promise.all(uploadPromises);
}
