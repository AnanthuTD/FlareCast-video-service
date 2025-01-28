import { RequestHandler } from "express";
import { sendMessage } from "../kafka/producer";
import { TOPICS } from "../config/topics";

export const videoViewController = <RequestHandler>(async (req, res) => {
	const { videoId } = req.params;
	const userId = req.user.id;

	const message = {
		videoId,
		userId,
		createdAt: new Date(),
	};

	await sendMessage(TOPICS.VIDEO_VIEW_EVENT, JSON.stringify(message));

	res.status(202).json({
		accepted: true,
		message: "View processing started",
	});
});
