import kafka from "./kafka";

const consumer = kafka.consumer({
	groupId: "video-service",
});

export async function consumeMessages() {
	const topics = ["user-events"];
  console.log("⌛ Consuming messages from topic(s):", topics);

	try {
		await consumer.connect();
		await consumer.subscribe({ topics });

		await consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				console.log({
					topic,
					partition,
					message: message.value?.toString(),
				});
			},
		});
	} catch (error) {
		console.error("🔴 Error consuming messages:", error);
	}
}
