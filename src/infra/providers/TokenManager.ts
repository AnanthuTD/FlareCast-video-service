import dayjs from "dayjs";
import { verify, decode } from "jsonwebtoken";
import env from "../env";
import { injectable } from "inversify";
import { logger } from "../logger";

/**
 * Provider for managing and validating authentication tokens.
 *
 * @class
 * @implements {ITokenManagerProvider}
 */
@injectable()
export class TokenManagerProvider implements ITokenManagerProvider {
	/**
	 * Validates whether a token has expired based on the provided expiration timestamp.
	 *
	 * @param {number} expiresIn - The expiration timestamp of the token.
	 * @returns {boolean} True if the token is expired, false otherwise.
	 */
	validateTokenAge(expiresIn: number): boolean {
		return dayjs().isAfter(dayjs.unix(expiresIn));
	}

	/**
	 * Validates the authenticity and integrity of a given token using the API secret.
	 *
	 * @param {string} token - The token to validate.
	 * @returns {boolean} True if the token is valid, false otherwise.
	 */
	validateAccessToken(token: string): boolean {
		try {
			verify(token, env.ACCESS_TOKEN_SECRET || "");
			return true;
		} catch (error) {
			logger.error(`Error on validating user access token with secret ${env.ACCESS_TOKEN_SECRET}: `);
			console.error(error);
			return false;
		}
	}
	validateAdminAccessToken(token: string): boolean {
		try {
			verify(token, env.ADMIN_ACCESS_TOKEN_SECRET || "");
			return true;
		} catch (error) {
			return false;
		}
	}

	getExpiresAt(token: string): number {
		const decoded = decode(token) as {
			exp: number;
		};
		return decoded.exp;
	}

	getPayload(token: string): { id: string; [key: string]: string } {
		const decoded = decode(token) as {
			id: string;
			[key: string]: string;
		};
		return decoded;
	}
}
