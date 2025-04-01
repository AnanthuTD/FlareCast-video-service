import app from "./app";
import env from "@/infra/env";
import { logger } from "@/infra/logger";
import { createServer } from "node:http";
import { KafkaConsumerService } from "@/infra/kafka/ConsumerService";
// import { connectRedis } from "@/infra/redis";
import { KafkaEventConsumer } from "@/infra/providers/KafkaEventConsumer";
import { initializeSocket } from "@/presentation/websocket/socket";
import "@/infra/kafka/setup-topics";

const bootstrap = async () => {
	try {
		logger.info("Starting application...");

		// Start Kafka consumer
    const eventConsumer = new KafkaEventConsumer()
		const consumerService = new KafkaConsumerService(eventConsumer);
		consumerService.start();

		// connect to redis
		// await connectRedis();

		const server = createServer(app);
		initializeSocket(server);
		server.listen(env.PORT, () => {
			logger.info(`Server running at http://localhost:${env.PORT}`);
		});
	} catch (err) {
		logger.error(`Error starting the server: ${(err as Error).message}`);
	}
};

bootstrap().catch((error) => {
	logger.error("Failed to start application:", error);
	process.exit(1);
});
