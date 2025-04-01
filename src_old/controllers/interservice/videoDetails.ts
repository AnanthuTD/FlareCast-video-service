import { Request, Response } from "express";
import prisma from "../../prismaClient";

export async function getVideoDetails(req: Request, res: Response) {
	try {
		const { videoId } = req.params;

		const video = await prisma.video.findFirst({
			where: {
				id: videoId,
				// userId: id,
			},
		});

		if (!video) {
			res.status(404).json({ message: "Video not found", video: null });
			return;
		}

		res.json({ video });
	} catch (error) {
    console.log(error);
  }
}
