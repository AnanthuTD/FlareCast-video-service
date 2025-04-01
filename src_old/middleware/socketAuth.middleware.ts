import passport from "passport";
import { Socket } from "socket.io";
import { logger } from "../logger/logger";

/**
 * Middleware for authenticating users using Passport
 */
export const authenticateWebsocketUser = (socket: Socket, next: (err?: Error) => void) => {
	const token = socket.handshake.auth.token;

	if (!token) {
		return next(new Error("Unauthorized: No token provided"));
	}

	socket.request.headers["authorization"] = `Bearer ${token}`;

	passport.authenticate("jwt", { session: false }, (err, user) => {
		if (err || !user) {
			return next(new Error("Unauthorized: Invalid token"));
		}
		socket.user = user;
		next();
	})(socket.request, {}, next);
};

/**
 * Middleware for authenticating admin using Passport
 */
export const authenticateWebsocketAdmin = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Unauthorized: No token provided"));
  }



  socket.request.headers["authorization"] = `Bearer ${token}`;

  passport.authenticate("admin-jwt", { session: false }, (err, admin) => {
    if (err || !admin) {
      return next(new Error("Unauthorized: Invalid token"));
    }
    console.log(admin)
    socket.admin = admin;
    next();
  })(socket.request, {}, next);
};