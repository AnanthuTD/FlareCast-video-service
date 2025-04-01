import { logger } from "@/infra/logger";
import { KafkaEventConsumer } from "../providers/KafkaEventConsumer";
import { createTopicHandlers } from "./event-handlers";

export class KafkaConsumerService {
	constructor(private consumer: KafkaEventConsumer) {}

	async start() {
		const topicHandlers = createTopicHandlers();
		const topics = Object.keys(topicHandlers) as string[];

		try {
			await this.consumer.subscribe(
				topics,
				async (topic: string, data: any) => {
					const handler = topicHandlers[topic];
					if (handler) {
						console.log(`new event from topic ${topic}: `, data);
						await handler(topic, data);
					} else {
						logger.warn(`No handler defined for topic: ${topic}`);
					}
				}
			);

			this.setupSignalHandlers();
		} catch (error) {
			logger.error("Failed to start consumer:", error);
			await this.consumer.disconnect();
			process.exit(1);
		}
	}

	private setupSignalHandlers() {
		process.on("SIGTERM", async () => {
			logger.info("Received SIGTERM, shutting down consumer...");
			await this.consumer.disconnect();
			process.exit(0);
		});

		process.on("SIGINT", async () => {
			logger.info("Received SIGINT, shutting down consumer...");
			await this.consumer.disconnect();
			process.exit(0);
		});
	}

	async stop() {
		logger.info("Stopping consumer...");
		await this.consumer.disconnect();
	}
}
