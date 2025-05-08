import { Router, Request, Response } from "express";
import compression from "compression";
import { createPromotionalVideoComposer } from "@/infra/services/composers/promotionalVideo/createPromotionalVideoComposer";
import { expressAdapter } from "@/presentation/adapters/express";
import { getPreviewVideoDetailsComposer } from "@/infra/services/composers/video/getPreviewVideoDetailsComposer";
import { deleteVideoComposer } from "@/infra/services/composers/video/deleteVideoComposer";
import { createUpdateVideoVisibilityComposer } from "@/infra/services/composers/video/videoVisibilityComposer";

const router = Router();

router.use(compression());

router.post(
	"/promotional-video",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(
			request,
			createPromotionalVideoComposer()
		);
		response.status(adapter.statusCode).json(adapter.body);
	}
);

router.get("/video/:videoId", async (request: Request, response: Response) => {
	const adapter = await expressAdapter(
		request,
		getPreviewVideoDetailsComposer()
	);
	response.status(adapter.statusCode).json(adapter.body);
});

router.delete(
	"/video/:videoId",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(request, deleteVideoComposer());
		response.status(adapter.statusCode).json(adapter.body);
	}
);

router.patch(
	"/video/:videoId/visibility",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(
			request,
			createUpdateVideoVisibilityComposer()
		);
		response.status(adapter.statusCode).json(adapter.body);
	}
);

router.all("/", (req, res) => {
	res.sendStatus(404);
});

export default router;
