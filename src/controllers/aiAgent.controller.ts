import { RequestHandler } from "express";
import queryTranscript from "../repository/aiAgent.repository";
import { logger } from "../logger/logger";
import prisma from "../prismaClient";

export const handleChat = <RequestHandler>(async (req, res) => {
	const { videoId, query } = req.body;
	const userId = req.user.id;
	const sessionId = `videoId${videoId}-userId-${userId}`; // TODO: Generate a unique session ID for each chat request

	if (!videoId || !query) {
		return res
			.status(400)
			.json({ error: "Missing videoId, sessionId, or query" });
	}

	try {
		const answer = await queryTranscript(videoId, userId, sessionId, query);

		// Save user message and AI response to DB
		const userChat = await prisma.chat.create({
			data: {
				videoId,
				userId: req.user?.id,
				message: query,
				sessionId,
			},
		});

		const aiChat = await prisma.chat.create({
			data: {
				videoId,
				message: answer,
				repliedToId: userChat.id,
				sessionId,
			},
		});

		res.json({ answer, sessionId });
	} catch (error) {
		logger.error("Error in chat:", error);
		res.status(500).json({ error: "Failed to process query" });
	}
});

export const handleClearChatHistory = <RequestHandler>(async (req, res) => {
	const { videoId, sessionId } = req.body;
	const userId = req.user.id;

	/* 	if (!videoId || userId) {
		return res.status(400).json({ error: "Missing sessionId" });
	} */

	try {
		await prisma.chat.deleteMany({
			where: {
				sessionId,
			},
		});
		res.json({ message: `Session ${sessionId} cleared` });
	} catch (error) {
		logger.error("Error clearing session:", error);
		res.status(500).json({ error: "Failed to clear session" });
	}
});

export const getChats: RequestHandler = async (req, res) => {
	const { videoId } = req.params;
	const { cursor, limit = "10" } = req.query;
	const sessionId = `videoId${videoId}-userId-${req.user?.id}`;

	try {
		const limitNum = parseInt(limit as string, 10);
		const chats = await prisma.chat.findMany({
			where: {
				sessionId: sessionId as string,
			},
			take: limitNum + 1,
			orderBy: { createdAt: "desc" },
			cursor: cursor ? { createdAt_id: cursor as string } : undefined,
			skip: cursor ? 1 : 0,
			include: {
				user: { select: { id: true, fullName: true } },
				repliedTo: {
					include: { user: { select: { id: true, fullName: true } } },
				},
			},
		});

		const hasNextPage = chats.length > limitNum;
		const resultChats = hasNextPage ? chats.slice(0, -1) : chats;
		const nextCursor = hasNextPage
			? `${resultChats[resultChats.length - 1].createdAt.toISOString()}_${
					resultChats[resultChats.length - 1].id
			  }`
			: null;

		res.json({
			chats: resultChats.map((chat) => ({
				id: chat.id,
				user: chat.user ?? { fullName: "", id: "ai" },
				message: chat.message,
				repliedTo: chat.repliedTo,
				videoId: chat.videoId,
				createdAt: chat.createdAt,
				sessionId: chat.sessionId,
			})).reverse(),
			nextCursor,
		});
	} catch (error) {
		logger.error("Error fetching chats:", error);
		res.status(500).json({ error: "Failed to fetch chats" });
	}
};
