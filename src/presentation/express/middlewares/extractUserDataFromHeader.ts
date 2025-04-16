import { AuthMessages } from "@/domain/enums/authenticate/AuthMessages";
import { type Request, type Response, type NextFunction } from "express";

/**
 * Middleware to extract user data from the X-User-Info header and load it to req.user
 */
export const extractUserInfo = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const userInfoHeader = req.headers["x-user-info"];

	if (!userInfoHeader) {
		req.user = null;
		res.status(401).json({
			message: AuthMessages.TokenInvalidOrExpired,
		});
		return;
	}

	try {
		const userData = JSON.parse(userInfoHeader as string);
		req.user = userData; // Attach to req.user
		next();
	} catch (error) {
		res.status(401).json({
			message: AuthMessages.TokenInvalidOrExpired,
		});
	}
};
