import { cleanEnv, str, port, url } from "envalid";

const env = cleanEnv(process.env, {
	NODE_ENV: str({
		choices: ["development", "test", "production", "staging"],
	}),
	PORT: port(),
	DATABASE_URL: url(),
	ELECTRON_HOST: url(),
	GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY: str(),
	GOOGLE_CLOUD_PROJECT_ID: str(),
	GOOGLE_CLOUD_BUCKET_NAME: str(),
	FFMPEG_LOCATION: str(),
	COLLABORATION_API_URL: url(),
	OPEN_AI_API_KEY: str(),
	GEMINI_API_KEY: str(),
	ACCESS_TOKEN_SECRET: str(),
	GCS_PUBLIC_URL: url(),
});

export default env;
