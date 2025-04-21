import { Router, Request, Response } from "express";
import protectedRoutes from "./protected";
import interserviceRoutes from "./interService";
import compression from "compression";
import { expressAdapter } from "@/presentation/adapters/express";
import { getPreviewVideoDetailsComposer } from "@/infra/services/composers/video/getPreviewVideoDetailsComposer";
import { getPromotionalVideosComposer } from "@/infra/services/composers/promotionalVideo/getPromotionalVideosComposer";

const router = Router();

router.use(compression());

router.use("/interservice", interserviceRoutes);

router.get(
	"/:videoId/preview",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(
			request,
			getPreviewVideoDetailsComposer()
		);
		response.status(adapter.statusCode).json(adapter.body);
	}
);

router.get(
	"/public/videos",
	async (request: Request, response: Response) => {
		const adapter = await expressAdapter(
			request,
			getPromotionalVideosComposer()
		);
		response.status(adapter.statusCode).json(adapter.body);
	}
);

router.use("/", protectedRoutes);

export default router;
