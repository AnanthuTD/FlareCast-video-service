import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { createWriteStream } from "fs";
import path from "path";
import morgan from "morgan";
import router from "./routes";
import env from "./env";
import fs from "node:fs";
import passport from "passport";
import "./authentication/JwtStrategy";
import "./kafka";
import { logger } from "./logger/logger";
import promClient from "prom-client";
import { WorkspaceService } from "./services/workspace.service";
import { VideoRepository } from "./repository/video.repository";
import { VideoProcessingService } from "./services/videoProcessing.service";

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ register: promClient.register });

const PORT = env.PORT;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(morgan("dev"));
app.use(express.static("hls-output"));
app.use(passport.initialize());
app.use("/api", passport.authenticate("jwt", { session: false }), router);
app.use("/metrics", async (req, res) => {
	res.setHeader("Content-Type", promClient.register.contentType);
	const metrics = await promClient.register.metrics();
	res.send(metrics);
	// console.log(metrics);
});

const io = new Server(server, {
	cors: {
		origin: env.ELECTRON_HOST,
		methods: ["GET", "POST"],
		credentials: true,
	},
});

io.on("connection", (socket) => {
	logger.info(`🟢 Socket connected: ${socket.id}`);

	socket.on("disconnect", () => {
		logger.info(`🔴 Socket disconnected: ${socket.id}`);
	});

	socket.on("video:chunks", (data: { fileName: string; chunks: Buffer }) => {
		logger.info(`🟣 Video chunk received for ${data.fileName}`);

		// Ensure the upload directory exists
		const uploadDir = path.join("temp_upload");
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}

		const writeStream = createWriteStream(path.join(uploadDir, data.fileName), {
			flags: "a",
		});

		writeStream.write(data.chunks, (err) => {
			if (err) {
				logger.error("Error writing chunk to file:", err);
			} else {
				logger.info("Chunk written successfully!");
			}
		});
	});

	socket.on(
		"process:video",
		async (data: {
			userId: string;
			fileName: string;
			folderId: string;
			workspaceId: string;
		}) => {
			logger.info("⚙️ Processing video...");

			try {
				// Retrieve workspace
				const workspaceId = await WorkspaceService.getSelectedWorkspace(
					data.userId,
					data.workspaceId,
					data.folderId
				);

				// Create video entry in DB
				const newVideo = await VideoRepository.createVideo(
					data.userId,
					workspaceId,
					data.folderId
				);

				// Process video
				await VideoProcessingService.processVideoFile(
					data.fileName,
					newVideo.id
				);

				// Mark video as processed
				await VideoRepository.updateProcessingStatus(newVideo.id, false);

				logger.info("✅ Video processing completed successfully!");
			} catch (error) {
				logger.error(`🔴 Error processing video: ${(error as Error).message}`);
			}
		}
	);
});

app.use((req: Request, res: Response) => {
	res.status(404).send({ message: "API not found" });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	logger.error(err.stack);
	res.status(500).send("Something went wrong!");
	next();
});

server.listen(PORT, async () => {
	logger.info(`🟢 Server is running on port ${PORT}`);
});
