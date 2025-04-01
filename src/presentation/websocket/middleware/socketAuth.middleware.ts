import { AuthMessages } from "@/domain/enums/authenticate/AuthMessages";
import { TokenManagerProvider } from "@/infra/providers/TokenManager";
import passport from "passport";
import { Socket } from "socket.io";

/**
 * Middleware for authenticating users using Passport
 */
export const authenticateWebsocketUser = (
	socket: Socket,
	next: (err?: Error) => void
) => {
	const token = socket.handshake.auth.token;

	if (!token) {
		return next(new Error(AuthMessages.AuthorizationHeaderMissing));
	}

	const tokenManager = new TokenManagerProvider();
	if (!tokenManager.validateAccessToken(token)) {
		return next(new Error(AuthMessages.TokenInvalidOrExpired));
	}

	const payload = tokenManager.getPayload(token);

	socket.user = payload;
	next();
};

/**
 * Middleware for authenticating admin using Passport
 */
export const authenticateWebsocketAdmin = (
	socket: Socket,
	next: (err?: Error) => void
) => {
	const token = socket.handshake.auth.token;

	if (!token) {
		return next(new Error(AuthMessages.AuthorizationHeaderMissing));
	}

	const tokenManager = new TokenManagerProvider();
	if (!tokenManager.validateAdminAccessToken(token)) {
		return next(new Error(AuthMessages.TokenInvalidOrExpired));
	}

	const payload = tokenManager.getPayload(token);

	socket.admin = payload;
	next();
};
