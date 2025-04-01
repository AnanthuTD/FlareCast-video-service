import axios from "axios";
import env from "../env";
import CircuitBreaker from "opossum";

interface SubscriptionLimitsResponse {
	message: string;
	permission: "granted" | "denied";
	maxVideoCount: number;
	totalVideoUploaded: number;
	aiFeature: boolean;
	maxRecordDuration: number; // in minutes
}

const subscriptionServiceBreaker = new CircuitBreaker(
	async (userId: string) => {
		const { data } = await axios.get(
			`${env.USER_SERVICE_API}/api/services/${userId}/upload-permission`,
			{ timeout: 2000 } 
		);
		return data;
	},
	{
		timeout: 2000, 
		errorThresholdPercentage: 50,
		resetTimeout: 30000,
	}
);

subscriptionServiceBreaker.on("open", () =>
	console.log("Circuit opened for subscription service")
);
subscriptionServiceBreaker.on("halfOpen", () =>
	console.log("Circuit half-open for subscription service")
);
subscriptionServiceBreaker.on("close", () =>
	console.log("Circuit closed for subscription service")
);

export class SubscriptionRepository {
	static async getLimits(userId: string): Promise<SubscriptionLimitsResponse> {
		const maxRetries = 3;
		let lastError: any;

		for (let attempt = 0; attempt < maxRetries; attempt++) {
			try {
				const data = await subscriptionServiceBreaker.fire(userId);
				return data as SubscriptionLimitsResponse;
			} catch (error) {
				lastError = error;
				console.warn(
					`Attempt ${
						attempt + 1
					} failed to fetch subscription limits for user ${userId}: ${
						error instanceof Error ? error.message : error
					}`
				);

				// Don't delay on the last attempt
				if (attempt < maxRetries - 1) {
					await new Promise((resolve) =>
						setTimeout(resolve, 1000 * Math.pow(2, attempt))
					);
				}
			}
		}

		// All retries failed or circuit is open
		console.error(
			`Failed to fetch subscription limits for user ${userId} after ${maxRetries} attempts: ${
				lastError instanceof Error ? lastError.message : lastError
			}`
		);
		throw new Error("Unable to retrieve subscription limits");
	}
}
