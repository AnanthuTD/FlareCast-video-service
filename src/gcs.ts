import { Storage } from "@google-cloud/storage";
import env from "./env";

const BUCKET_NAME = env.GOOGLE_CLOUD_BUCKET_NAME;

const storage = new Storage({
	keyFilename: env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY,
	projectId: env.GOOGLE_CLOUD_PROJECT_ID,
});

export const bucket = storage.bucket(BUCKET_NAME);