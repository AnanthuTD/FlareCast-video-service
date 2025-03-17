import { RequestHandler } from "express";
import prisma from "../prismaClient";
import { VideoType } from "@prisma/client";
import { WorkspaceService } from "../services/workspace.service";
import jwt from "jsonwebtoken";
import env from "../env";

export const getLiveStreamToken: RequestHandler = async (req, res) => {
	const userId = req.user.id;

	try {
		const workspaceId = await WorkspaceService.getSelectedWorkspace(userId);
		if (!workspaceId) {
			res.status(404).json({ error: "No workspace selected" });
			return;
		}

		const newLiveStream = await prisma.video.create({
			data: {
				type: VideoType.LIVE,
				workspaceId,
				userId,
			},
		});

		const token = jwt.sign(
			{
				id: newLiveStream.id,
				type: VideoType.LIVE,
				workspaceId: newLiveStream.workspaceId,
				userId: newLiveStream.userId,
				// exp: Math.floor(Date.now() / 1000) + 60 * 60,
			},
			env.LIVESTREAM_SECRET
		);

		res.json({ token, streamKey: newLiveStream.id });
	} catch (error) {}
};
