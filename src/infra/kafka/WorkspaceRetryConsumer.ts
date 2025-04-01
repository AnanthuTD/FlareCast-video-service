import { logger } from "@/infra/logger";
import {
	IWorkspaceService,
	WorkspaceService,
} from "@/app/services/implementation/WorkspaceService";
import { KafkaEventPublisher } from "@/infra/providers/KafkaEventPublisher";
import { EventService } from "@/app/services/implementation/EventService";
import { IEventService } from "@/app/services/IEventService";
import { IEventConsumer } from "@/app/interfaces/IEventConsumer";

export class WorkspaceRetryConsumer {
	private eventService: IEventService;
	private workspaceService: IWorkspaceService;
	private pendingMessages: any[] = [];

	constructor(
		eventService: IEventService,
		workspaceService: IWorkspaceService,
		eventConsumer: IEventConsumer
	) {
		this.eventService = eventService;
		this.workspaceService = workspaceService;

		// Listen to circuit breaker state changes
		this.workspaceService["breaker"].on("open", () => {
			logger.info("Circuit opened, pausing workspace retry consumer.");
			eventConsumer.pause([{ topic: "workspace.validation.pending" }]);
		});

		this.workspaceService["breaker"].on("close", async () => {
			logger.info("Circuit closed, resuming workspace retry consumer.");
			await this.processPendingEvents();
			eventConsumer.resume([{ topic: "workspace.validation.pending" }]);
		});
	}

	private async processPendingEvents() {
		while (this.pendingMessages.length > 0) {
			const data = this.pendingMessages.shift();
			await this.processEvent(data);
		}
	}

	private async processEvent(data: {
		userId: string;
		workspaceId?: string;
		folderId?: string;
		spaceId?: string;
	}) {
		try {
			const result = await this.workspaceService.getSelectedWorkspace(data);
			logger.info(`Successfully validated workspace for user ${data.userId}`);
			// Publish success event to continue the workflow (e.g., from previous refactored code)
			await this.eventService.publishSelectedWorkspaceValidatedEvent({
				userId: data.userId,
				workspaceId: result.selectedWorkspace,
				folderId: result.selectedFolder,
				spaceId: result.selectedSpace,
			});
		} catch (error) {
			logger.error(`Failed to retry workspace validation: ${error.message}`);
			// Re-queue the event if it fails again
			await this.eventService.publishSelectedWorkspacePendingEvent(data);
		}
	}
}

// Usage example
export const initializeWorkspaceRetryConsumer = () => {
	const eventService = new EventService(new KafkaEventPublisher());
	const workspaceService = new WorkspaceService(eventService);
	const retryConsumer = new WorkspaceRetryConsumer(
		eventService,
		workspaceService
	);
	retryConsumer
		.start()
		.catch((err) => logger.error("Error in retry consumer:", err));
};
