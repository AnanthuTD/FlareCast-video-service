import { RequestHandler } from "express";
import s3Client from "../s3";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "../env";

export class VideoEditController {
	static generatePresignedUrl: RequestHandler = async (req, res) => {
		const { videoId } = req.query;

		if (!videoId) {
			return res.status(400).json({ error: "Video ID is required" });
		}

		// TODO: check if user has access before generating the presigned url.

		try {
			const key = `edited/${videoId}/edited-video.webm`;

			const command = new PutObjectCommand({
				Bucket: env.AWS_S3_BUCKET_NAME,
				Key: key,
				ContentType: "video/webm",
			});

			/* const command = new PutObjectCommand({
				Bucket: env.AWS_S3_BUCKET_NAME,
				Key: `edited/${videoId}/test-string.txt`, // Use a different key for testing
				ContentType: "text/plain", // Allow text/plain for testing
			}); */

			const signedUrl = await getSignedUrl(s3Client, command, {
				expiresIn: 3600,
			});
			console.debug("signed url: " + signedUrl);

			res.json({ signedUrl });
		} catch (error) {
			console.error("Error generating presigned URL:", error);
			res.status(500).json({ error: "Failed to generate presigned URL" });
		}
	};
}
