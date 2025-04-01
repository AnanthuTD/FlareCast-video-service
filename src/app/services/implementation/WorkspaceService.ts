import CircuitBreaker from "opossum";
import { logger } from "@/infra/logger";
import env from "@/infra/env";
import axios from "axios";

export interface IWorkspaceService {
	getSelectedWorkspace(data: {
		userId: string;
		workspaceId?: string;
		folderId?: string;
		spaceId?: string;
	}): Promise<{
		selectedWorkspace: string;
		selectedFolder?: string;
		selectedSpace?: string;
	}>;
}

export class WorkspaceService implements IWorkspaceService {
	private readonly breaker: CircuitBreaker;

	constructor(onOpen?: () => void, onClose?: () => void) {
		this.breaker = new CircuitBreaker(
			async (
				userId: string,
				workspaceId?: string,
				folderId?: string,
				spaceId?: string
			) => {
				console.log("From getSelectedWorkspace circuit breaker: ", userId);

				const url =
					workspaceId || spaceId
						? `${
								env.COLLABORATION_API_URL
						  }/workspace/${userId}/selected?workspaceId=${workspaceId}&folderId=${
								folderId || ""
						  }&spaceId=${spaceId || ""}`
						: `${env.COLLABORATION_API_URL}/workspace/${userId}/selected`;

				const response = await axios.get(url, { timeout: 2000 });
				return response.data;
			},
			{
				timeout: 2000,
				errorThresholdPercentage: 50,
				resetTimeout: 30000,
			}
		);

		this.breaker.on("open", () => {
			logger.info("Circuit opened, pausing workspace retry consumer.");
			onOpen?.();
		});

		this.breaker.on("halfOpen", () => {
			logger.info("Circuit half closed, pausing workspace retry consumer.");
			onClose?.();
		});

		this.breaker.on("close", () => {
			logger.info("Circuit closed, pausing workspace retry consumer.");
			onClose?.();
		});
	}

	async getSelectedWorkspace(data: {
		userId: string;
		workspaceId?: string;
		folderId?: string;
		spaceId?: string;
	}): Promise<{
		selectedWorkspace: string;
		selectedFolder?: string;
		selectedSpace?: string;
	}> {
		const maxRetries = 3;
		let lastError: any;

		console.log("From getSelectedWorkspace: ", data);

		const { userId, workspaceId, folderId, spaceId } = data;

		for (let attempt = 0; attempt < maxRetries; attempt++) {
			try {
				return await this.breaker.fire(userId, workspaceId, folderId, spaceId);
			} catch (error) {
				lastError = error;
				logger.warn(
					`Attempt ${
						attempt + 1
					} failed to fetch workspace for user ${userId}: ${
						error instanceof Error ? error.message : error
					}`
				);

				if (axios.isAxiosError(error) && error.response) {
					logger.info(
						`Service responded with status ${error.response.status}, returning data`
					);
					throw error;
				}

				if (attempt < maxRetries - 1) {
					await new Promise((resolve) =>
						setTimeout(resolve, 1000 * Math.pow(2, attempt))
					);
				}
			}
		}

		// If all retries fail or circuit is open, store the event in Kafka
		logger.error(
			`Failed to fetch workspace for user ${userId} after ${maxRetries} attempts: ${
				lastError instanceof Error ? lastError.message : lastError
			}`
		);

		// Throw an error to inform the caller that the operation is deferred
		if (this.breaker.opened) {
			throw new Error(
				"Collaboration service unavailable; request queued for retry."
			);
		} else if (axios.isAxiosError(lastError)) {
			throw new Error(
				`Unable to retrieve workspace: ${
					lastError.response?.data?.message || "Unknown error"
				}`
			);
		}
		throw new Error("Unknown error occurred while fetching workspace.");
	}
}
