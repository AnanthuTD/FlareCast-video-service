import kafka from "./kafka";

const producer = kafka.producer({});

export async function sendMessage(topic: string, message: string) {
	try {
		await producer.connect();

		await producer.send({
			topic,
			messages: [{ value: message }],
		});

		await producer.disconnect();
	} catch (error) {
    console.error("🔴 Failed to send message to " + topic, error);
  }
}
