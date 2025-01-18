import { Request, Response } from "express";

export const streamVideo = async (req: Request, res: Response) => {
	try {
		const { file } = req.params;
		const filePath = `https://storage.googleapis.com/flarecast_video_recordings/${file}/master.m3u8`;
    res.json({url: filePath})
	} catch (err) {
		console.error(err);
		res.status(500).send("Error streaming file.");
	}
};

// https://storage.googleapis.com/flarecast_video_recordings/67812ea43a35ec1436eff807/master.m3u8