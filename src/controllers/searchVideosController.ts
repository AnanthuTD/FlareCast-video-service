import { RequestHandler } from "express";
import { VideoRepository } from "../repository/video.repository";

export const searchVideosController = <RequestHandler>(async (req, res) => {
	const { query, paginationToken, workspaceId, limit = "1" } = req.query;

	if (!query || typeof query !== "string" || !workspaceId) {
		res.json({ results: [] });
		return;
	}

	const results = await VideoRepository.searchVideo({
		query: query as string,
		limit: parseInt(limit as string) || 0,
		direction: "searchAfter",
		paginationToken: paginationToken ? (paginationToken as string) : undefined,
		workspaceId: workspaceId as string,
	});

	res.json({ results });
});
