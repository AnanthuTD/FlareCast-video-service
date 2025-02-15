import { TOPICS } from "../../config/topics";
import { sendMessage } from "../producer";

export async function sendVideoUploadEvent(data: { s3Key: string; videoId: string }) {
	const message = JSON.stringify(data);
	await sendMessage(TOPICS.VIDEO_UPLOAD_EVENT, message);
}
