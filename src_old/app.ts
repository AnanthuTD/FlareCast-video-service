import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes";
import passport from "passport";
import "./authentication/JwtStrategy";
import "./kafka";
import promClient from "prom-client";
import { errorHandler } from "./middleware/errorHandler";
import { tokenExtractorMiddleware } from "./middleware/tokenExtractor.middleware";
import cookieParser from "cookie-parser";

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ register: promClient.register });

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(tokenExtractorMiddleware);
app.use(express.static("hls-output"));
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);
app.use("/", (req, res) => {
	res.send("pong");
});
app.use("/metrics", async (req, res) => {
	res.setHeader("Content-Type", promClient.register.contentType);
	const metrics = await promClient.register.metrics();
	res.send(metrics);
	// console.log(metrics);
});

app.use((req: Request, res: Response) => {
	res.status(404).send({ message: "API not found" });
});

// Error handling middleware
app.use(errorHandler);

export default app