import { RequestHandler } from "express";
import prisma from "../prismaClient";
import { VideoType } from "@prisma/client";
import { WorkspaceService } from "../services/workspace.service";
import jwt from "jsonwebtoken";
import env from "../env";
import { logger } from "../logger/logger";

export const getLiveStreamToken: RequestHandler = async (req, res) => {
	const userId = req.user.id;
	const workspaceId = req.query.workspaceId;
	const folderId = req.query.folderId;
	const spaceId = req.query.spaceId;

	logger.debug("generating live stream token");

	try {
		const selectedData = await WorkspaceService.getSelectedWorkspace({
			userId,
			workspaceId,
			folderId,
			spaceId,
		});
		if (!selectedData.selectedWorkspace) {
			res.status(404).json({ error: "No workspace selected" });
			return;
		}

		const newLiveStream = await prisma.video.create({
			data: {
				type: VideoType.LIVE,
				workspaceId: selectedData.selectedWorkspace || undefined,
				folderId: selectedData.selectedFolder || undefined,
				spaceId: selectedData.selectedSpace || undefined,
				userId,
				transcodeStatus: "SUCCESS",
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
