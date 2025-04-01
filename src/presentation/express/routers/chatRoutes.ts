import { Router, Request, Response } from "express";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { expressAdapter } from "@/presentation/adapters/express";
import { sendChatMessageComposer } from "@/infra/services/composers/chat/sendChatMessageComposer";
import { clearChatSessionComposer } from "@/infra/services/composers/chat/clearChatSessionComposer";
import { getChatsComposer } from "@/infra/services/composers/chat/getChatsComposer";

const chatRoutes = Router();

chatRoutes.use(ensureAuthenticated);

chatRoutes.post("/", async (request: Request, response: Response) => {
	const adapter = await expressAdapter(request, sendChatMessageComposer());
	response.status(adapter.statusCode).json(adapter.body);
});

chatRoutes.post(
	"/clear-session",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, clearChatSessionComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

chatRoutes.get(
	"/:videoId",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, getChatsComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);


export default chatRoutes;
