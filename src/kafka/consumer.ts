import { logger } from "../logger/logger";
import kafka from "./kafka";

const consumer = kafka.consumer({
	groupId: "video-service",
});

export async function consumeMessages() {
	const topics = ["user-events"];
  logger.info("⌛ Consuming messages from topic(s):", topics);

	try {
		await consumer.connect();
		await consumer.subscribe({ topics });

		await consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				logger.info({
					topic,
					partition,
					message: message.value?.toString(),
				});
			},
		});
	} catch (error) {
		logger.error("🔴 Error consuming messages:", error);
	}
}
