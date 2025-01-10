import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { createWriteStream } from "fs";
import path from "path";
import morgan from "morgan";
import router from "./routes";
import { createHLSAndUpload } from "./uploadToGCS";
import env from "./env";
import prisma from "./prismaClient";
import fs from "node:fs";
import { processVideo } from "./openai/processVideo";
import passport from "passport";
import "./authentication/JwtStrategy";
import { createThumbnails } from "./createThumbnails";

const PORT = env.PORT;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(morgan("dev"));
app.use(express.static("hls-output"));
app.use(passport.initialize());
app.use("/api", passport.authenticate("jwt", { session: false }), router);

const io = new Server(server, {
	cors: {
		origin: env.ELECTRON_HOST,
		methods: ["GET", "POST"],
		credentials: true,
	},
});

let recordedChunks: BlobEvent["data"][] = [];

io.on("connection", (socket) => {
	console.log(`🟢 Socket connected: ${socket.id}`);

	socket.on("disconnect", () => {
		console.log(`🔴 Socket disconnected: ${socket.id}`);
	});

	socket.on("video:chunks", (data: { fileName: string; chunks: Buffer }) => {
		console.log(`🟣 Video chunk received for ${data.fileName}`, data);

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
				console.error("Error writing chunk to file:", err);
			} else {
				console.log("Chunk written successfully!");
			}
		});
	});

	socket.on(
		"process:video",
		async (data: { userId: string; fileName: string }) => {
			// Type for received data
			console.log("⚙️ Processing video...");

			recordedChunks = [];

			const newVideo = await prisma.video.create({
				data: {
					userId: data.userId,
				},
			});

			const inputVideo = path.join(process.cwd(), "temp_upload", data.fileName);
			const outputDirectory = path.join(
				process.cwd(),
				`hls-output/${newVideo.id}`
			);
			const gcsPath = newVideo.id;

			try {
				await createHLSAndUpload(inputVideo, outputDirectory, gcsPath);
				createThumbnails(inputVideo, path.join(outputDirectory, 'thumbnails'), gcsPath)

				// TODO: Fetch plan from user_service.
				if (true) await processVideo(inputVideo, newVideo.id);
			} catch (error) {
				console.error("🔴 HLS processing failed:", error);
			}

			try {
				await prisma.video.update({
					where: { id: newVideo.id },
					data: {
						processing: false,
					},
				});
				console.log("✅ prisma video processing completed successfully!");
			} catch (error) {
				console.error("🔴 prisma video processing failed:", error);
			}
		}
	);
});

app.use((req: Request, res: Response) => {
	res.status(404).send({ message: "API not found" });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	res.status(500).send("Something went wrong!");
	next();
});

server.listen(PORT, async () => {
	console.log(`🟢 Server is running on port ${PORT}`);
});
