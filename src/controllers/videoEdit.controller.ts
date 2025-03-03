import { RequestHandler } from "express";
import s3Client from "../s3";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "../env";
import prisma from "../prismaClient";
import { sendVideoUploadEvent } from "../kafka/handlers/videoUploadEvent.producer";

export class VideoEditController {
	static generatePresignedUrl: RequestHandler = async (req, res) => {
		const { videoId } = req.query;

		if (!videoId) {
			return res.status(400).json({ error: "Video ID is required" });
		}

		// TODO: check if user has access before generating the presigned url.

		try {
			const video = await prisma.video.findUnique({
				where: { id: videoId },
			});

			if (!video) {
				res.status(404).json({ message: "Video not found" });
				return;
			}

			const editedVideo = await prisma.video.create({
				data: {
					title: `edited-${video.title}`,
					userId: video.userId,
					workspaceId: video.workspaceId,
					folderId: video.folderId,
				},
			});

			// const key = `edited/${videoId}/edited-video.webm`;
			const key = `${editedVideo.id}/original.webm`;

			const command = new PutObjectCommand({
				Bucket: env.AWS_S3_BUCKET_NAME,
				Key: key,
				ContentType: "video/webm",
			});

			const signedUrl = await getSignedUrl(s3Client, command, {
				expiresIn: 3600,
			});
			console.debug("signed url: " + signedUrl);

			res.json({ signedUrl, videoId: editedVideo.id, key });
		} catch (error) {
			console.error("Error generating presigned URL:", error);
			res.status(500).json({ error: "Failed to generate presigned URL" });
		}
	};

	static onSuccess: RequestHandler = async (req, res) => {
		console.debug("onSuccess handler");
		const { videoId } = req.params;
		const { key, status } = req.body;

		if (!videoId || !key || !status) {
			return res.status(400).json({ error: "Video ID and key are required" });
		}

		if (status !== "success") {
			await prisma.video.delete({
				where: {
					id: videoId,
				},
			});
			res
				.status(200)
				.json({ message: "Video deleted successfully since editing failed!" });

			return;
		}

		res.json({ message: "Video upload succeeded and is in processing stage" });

		await sendVideoUploadEvent({ s3Key: key, videoId: videoId as string });
	};
}
