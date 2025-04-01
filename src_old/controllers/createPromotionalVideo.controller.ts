import { RequestHandler } from "express";
import prisma from "../prismaClient";
import { VideoCategory } from "@prisma/client";
import { logger } from "../logger/logger";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import env from "../env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../s3";

export const createPromotionalVideo: RequestHandler = async (req, res) => {
	try {
		const newPromoVideo = await prisma.video.create({
			data: {
				title: req.body.title,
				description: req.body.description,
				type: "VOD",
				category: VideoCategory.PROMOTIONAL,
			},
			select: {
				id: true,
			},
		});

		const key = `${newPromoVideo.id}/original.${req.body.videoExtension}`;

		const command = new PutObjectCommand({
			Bucket: env.AWS_S3_BUCKET_NAME,
			Key: key,
			ContentType: `video/${req.body.videoExtension}`,
		});

		const signedUrl = await getSignedUrl(s3Client, command, {
			expiresIn: 3600,
		});

		res.status(201).json({
			message: "Promotional video created successfully",
			videoId: newPromoVideo.id,
			signedUrl,
		});
	} catch (error) {
		logger.error("Error creating promotional video", error);
		console.error(error);
		res.status(500).json({ message: "Failed to create promotional video" });
	}
};
