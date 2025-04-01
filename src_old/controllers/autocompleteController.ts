import { RequestHandler } from "express";
import { VideoRepository } from "../repository/video.repository";
import { logger } from "../logger/logger";

export const autocompleteSearchVideosController = <RequestHandler>(async (
	req,
	res
) => {
	const { query, workspaceId, limit = "1", paginationToken = "" } = req.query;

	if (!query || typeof query !== "string" || !workspaceId) {
		res.json({ results: [] });
		return;
	}

	logger.debug(query, workspaceId);

	const results = await VideoRepository.suggestVideos({
		query: query as string,
		limit: parseInt(limit as string) || 1,
		workspaceId: workspaceId as string,
		paginationToken: (paginationToken as string) || "",
		direction: "searchAfter",
	});

	res.json({ results });
});
