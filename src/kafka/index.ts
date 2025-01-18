import { createTopic } from "./admin";
import { consumeMessages } from "./consumer";

createTopic().then(() => {
  console.log("✅ Topic created successfully");
  consumeMessages()
});