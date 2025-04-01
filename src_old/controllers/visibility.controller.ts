import { RequestHandler } from "express";
import prisma from "../prismaClient";

export const visibilityController: RequestHandler = async (req, res) => {
	const { videoId } = req.params;
	const userId = req.user.id;

	const video = await prisma.video.findFirst({
		where: {
			id: videoId,
			userId: userId,
		},
	});

	if (!video) {
		res.status(404).json({ message: "Video not found" });
		return;
	}

	const visibility = await prisma.video.update({
		where: {
			id: video.id,
		},
		data: {
			isPublic: req.body.isPublic,
		},
	});

	res.json({
		isPublic: visibility.isPublic,
		messsage: `Visibility updated to ${visibility.isPublic}`,
	});
};
