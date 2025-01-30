import { cleanEnv, str, port, url } from "envalid";

const env = cleanEnv(process.env, {
	NODE_ENV: str({
		choices: ["development", "test", "production", "staging"],
	}),
	PORT: port(),
	DATABASE_URL: url(),
	ELECTRON_HOST: url(),
	FFMPEG_LOCATION: str(),
	COLLABORATION_API_URL: url(),
	GEMINI_API_KEY: str(),
	ACCESS_TOKEN_SECRET: str(),
	KAFKA_BROKER: str(),
	KAFKA_USERNAME: str(),
	KAFKA_PASSWORD: str(),
	WHISPER_API: str(),
	GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_FILE: str({ default: undefined }),
	HUGGINGFACE_TOKEN: str(),
	GRAFANA_HOST: str(),
	LOKI_API_KEY: str(),
	LOKI_USER_ID: str(),
	GOOGLE_CLOUD_PUBLIC_URL: str(),
	AWS_CLOUDFRONT_URL: str(),
});

export default env;
