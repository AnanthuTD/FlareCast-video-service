import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import axios from "axios";
import path from "path";
import morgan from "morgan";
import router from "./routes";
import { createHLSAndUpload } from "./uploadToGCS";

const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(morgan("dev"));
app.use(express.static("hls-output"));
app.use("/api", router);

const io = new Server(server, {
	cors: {
		origin: process.env.ELECTRON_HOST,
		methods: ["GET", "POST"],
		credentials: true,
	},
});

let recordedChunks: BlobEvent['data'][] = [];

io.on("connection", (socket) => {
	console.log(`🟢 Socket connected: ${socket.id}`);

	socket.on("disconnect", () => {
		console.log(` Socket disconnected: ${socket.id}`);
	});

	socket.on(
		"video:chunks",
		async (data: { fileName: string; chunks: BlobEvent["data"] }) => {
			// Type for received data
			console.log(` Video chunks received`, data);

			const writeStream = createWriteStream(
				path.join("temp_upload", data.fileName)
			); // Use path.join
			recordedChunks.push(data.chunks);
			const videoBlob = new Blob(recordedChunks, {
				type: "video/webm; codecs=vp9",
			});
			const buffer = Buffer.from(await videoBlob.arrayBuffer());
			const readStream = Readable.from(buffer);
			readStream.pipe(writeStream).on("finish", () => {
				console.log("✅ Video recorded successfully!");
			});
		}
	);

	socket.on(
		"process:video",
		async (data: { userId: string; fileName: string }) => {
			// Type for received data
			console.log(" Processing video...");

			recordedChunks = [];

			const response = await axios.post(
				`${process.env.COLLABORATION_API_URL}/video/processing/userId/${data.userId}`
			);

			const inputVideo = path.join(process.cwd(), "temp_videos", data.fileName);
			const outputDirectory = path.join(process.cwd(), "hls-output/video_id");
			const gcsPath = response.data.id;

			try {
      await createHLSAndUpload(inputVideo, outputDirectory, gcsPath);
    } catch (error) {
      console.error("HLS processing failed:", error);
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

app.listen(PORT, async () => {
	console.log(`🟢 Server is running on port ${PORT}`);
});
