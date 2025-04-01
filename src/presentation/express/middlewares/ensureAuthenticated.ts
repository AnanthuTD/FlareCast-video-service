import { NextFunction, Request, RequestHandler, Response } from "express";

import { AuthMessages } from "@/domain/enums/authenticate/AuthMessages";
import { TokenManagerProvider } from "../../../infra/providers/TokenManager";

/**
 * Middleware to ensure that the incoming request is authenticated.
 * Checks for the presence of an authorization token and its validity.
 *
 * @param {Request} request - The Express request object.
 * @param {Response} response - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @returns {Response | void} Returns a response with an error message or proceeds to the next middleware.
 */
export const ensureAuthenticated: RequestHandler = (
	request: Request,
	response: Response,
	next: NextFunction
) => {
	const token = request.cookies.accessToken;

	if (!token) {
		response.status(401).json({
			message: AuthMessages.AuthorizationHeaderMissing,
		});
		return;
	}

	const tokenManager = new TokenManagerProvider();
	if (!tokenManager.validateAccessToken(token)) {
		response.status(401).json({
			message: AuthMessages.TokenInvalidOrExpired,
		});
		return;
	}

	const payload = tokenManager.getPayload(token);

	request.user = payload;

	return next();
};

export const ensureAdminAuthenticated: RequestHandler = (
	request: Request,
	response: Response,
	next: NextFunction
) => {
	const token = request.cookies.accessToken;

	if (!token) {
		response.status(401).json({
			message: AuthMessages.AuthorizationHeaderMissing,
		});
		return;
	}

	const tokenManager = new TokenManagerProvider();
	if (!tokenManager.validateAdminAccessToken(token)) {
		response.status(401).json({
			message: AuthMessages.TokenInvalidOrExpired,
		});
		return;
	}

	const payload = tokenManager.getPayload(token);

	request.user = payload;

	return next();
};
