import { Router, Request, Response } from "express";
import { expressAdapter } from "@/presentation/adapters/express";

// import middlewares
import { extractUserInfo } from "../middlewares/extractUserDataFromHeader";

// import routes
import chatRoutes from "./chatRoutes";

// import controllers
import eventsController from "@/presentation/http/controllers/sse/eventController";

// Import composer functions
import { createUpdateVideoVisibilityComposer } from "@/infra/services/composers/video/videoVisibilityComposer";
import { autocompleteSearchVideosComposer } from "@/infra/services/composers/video/autocompleteSearchVideosComposer";
import { getVideosComposer } from "@/infra/services/composers/video/getVideosComposer";
import { getLiveStreamTokenComposer } from "@/infra/services/composers/getLiveStreamTokenComposer";
import { generatePresignedUrlComposer } from "@/infra/services/composers/video/generatePresignedUrlComposer";
import { searchVideosComposer } from "@/infra/services/composers/video/searchVideosComposer";
import { watchLaterRemoveComposer } from "@/infra/services/composers/watchLater/watchLaterRemoveComposer";
import { watchLaterGetComposer } from "@/infra/services/composers/watchLater/watchLaterGetComposer";
import { deleteVideoComposer } from "@/infra/services/composers/video/deleteVideoComposer";
import { getVideoDetailsComposer } from "@/infra/services/composers/video/getVideoDetailsComposer";
import { videoViewComposer } from "@/infra/services/composers/video/videoViewComposer";
import { updateVideoTitleComposer } from "@/infra/services/composers/video/updateVideoTitleComposer";
import { updateVideoDescriptionComposer } from "@/infra/services/composers/video/updateVideoDescriptionComposer";
import { videoShareComposer } from "@/infra/services/composers/video/videoShareComposer";
import { videoMoveComposer } from "@/infra/services/composers/video/videoMoveComposer";
import { videoEditSuccessComposer } from "@/infra/services/composers/video/videoEditSuccessComposser";
import { getVideoCountComposer } from "@/infra/services/composers/video/getVideoCountComposer";
import { watchLaterAddComposer } from "@/infra/services/composers/watchLater/watchLaterAddComposer";

const protectedRoutes = Router();

protectedRoutes.use(extractUserInfo);

protectedRoutes.use("/chats", chatRoutes);

protectedRoutes.get("/count", async (request: Request, response: Response) => {
	const adapter = await expressAdapter(request, getVideoCountComposer());
	response.status(adapter.statusCode).json(adapter.body);
});

// Video-related endpoints
protectedRoutes.patch(
	"/:videoId/visibility",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(
			request,
			createUpdateVideoVisibilityComposer()
		);
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.get("/:workspaceId/events", eventsController);

protectedRoutes.get(
	"/stream-key",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, getLiveStreamTokenComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.get(
	"/upload-presigned-url",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(
			request,
			generatePresignedUrlComposer()
		);
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.post(
	"/:videoId/edit-success",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, videoEditSuccessComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

// Search-related endpoints
protectedRoutes.get("/search", async (request: Request, response: Response) => {
	const adapter = await expressAdapter(request, searchVideosComposer());
	response.status(adapter.statusCode).json(adapter.body);
});

protectedRoutes.get(
	"/search/autocomplete",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(
			request,
			autocompleteSearchVideosComposer()
		);
		response.status(adapter.statusCode).json(adapter.body);
	}
);

// Watch Later endpoints
protectedRoutes.post(
	"/watch-later",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, watchLaterAddComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.delete(
	"/:videoId/watch-later",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, watchLaterRemoveComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.get(
	"/watch-later",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, watchLaterGetComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

// Workspace and Video CRUD endpoints
protectedRoutes.get(
	"/:workspaceId",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, getVideosComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.delete(
	"/:videoId",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, deleteVideoComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.get(
	"/:videoId/video",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, getVideoDetailsComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.patch(
	"/:videoId/viewed",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, videoViewComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.put(
	"/:videoId/update/title",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, updateVideoTitleComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.put(
	"/:videoId/update/description",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(
			request,
			updateVideoDescriptionComposer()
		);
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.post(
	"/:videoId/share",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, videoShareComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

protectedRoutes.post(
	"/:videoId/move",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, videoMoveComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

export default protectedRoutes;
