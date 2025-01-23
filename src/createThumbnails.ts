import ffmpeg from "fluent-ffmpeg";
import { fixWebMDuration } from "./fixDuration";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import { uploadDirectoryToGCS } from "./uploadToGCS";
import { logger } from "./logger/logger";

export const createThumbnails = async (
	videoPath: string,
	thumbnailOutputDir: string,
	gcsPath: string
) => {
	try {
		const videoDuration = await fixWebMDuration(
			videoPath,
			path.join(process.cwd(), `remuxed_video`, `${randomUUID()}.webm`)
		);

		if (!videoDuration) {
			logger.info(
				"🔴 Unable to fix video duration. Skipping thumbnail generation."
			);
			return;
		}

		const videoDurationNum = parseFloat(videoDuration);

		if (!fs.existsSync(thumbnailOutputDir)) {
			fs.mkdirSync(thumbnailOutputDir, { recursive: true });
		}

		const timemarks = Array.from(
			{ length: Math.max(Math.floor(videoDurationNum / 10), 1) },
			(_, i) => `${i * 10}`
		);

		logger.info("====timemarks===", timemarks, videoDuration);

		ffmpeg(videoPath)
			.on("filenames", function (filenames) {
				logger.info("screenshots are " + filenames.join(", "));
			})
			.on("end", () => {
				logger.info("✅ Thumbnails generated successfully.\n⚙️ Now uploading thumbnails to GCS...");
				uploadDirectoryToGCS(thumbnailOutputDir, gcsPath + "/thumbnails");
			})
			.on("error", (err) => {
				logger.error("🔴 Error generating thumbnails:", err);
			})
			.screenshots({
				count: Math.floor(videoDurationNum / 10),
				timemarks,
				filename: "thumb%0000i.jpg",
				folder: thumbnailOutputDir,
			});
	} catch (err) {
		logger.error("🔴 Error creating thumbnails:", err);
	}
};
