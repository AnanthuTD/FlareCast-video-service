import { Router, Request, Response } from "express";
import compression from "compression";
import { createPromotionalVideoComposer } from "@/infra/services/composers/promotionalVideo/createPromotionalVideoComposer";
import { expressAdapter } from "@/presentation/adapters/express";
import { getPreviewVideoDetailsComposer } from "@/infra/services/composers/video/getPreviewVideoDetailsComposer";

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

export default router;
