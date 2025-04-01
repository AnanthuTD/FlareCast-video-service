import {
	PutObjectCommand,
	ListObjectsV2Command,
	DeleteObjectsCommand,
	PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "@/infra/s3";
import env from "@/infra/env";
import { IS3Service } from "../IS3Service";
import { logger } from "@/infra/logger";
import path from "node:path";
import fs from "fs/promises";

export class S3Service implements IS3Service {
	BUCKET_NAME = env.AWS_S3_BUCKET_NAME;

	async generateUploadUrl(key: string, contentType: string): Promise<string> {
		const command = new PutObjectCommand({
			Bucket: env.AWS_S3_BUCKET_NAME,
			Key: key,
			ContentType: contentType,
		});
		return getSignedUrl(s3Client, command, { expiresIn: 3600 });
	}

	async deleteObjectsByPrefix(prefix: string): Promise<string[]> {
		const listResponse = await s3Client.send(
			new ListObjectsV2Command({
				Bucket: env.AWS_S3_BUCKET_NAME,
				Prefix: prefix,
			})
		);

		if (!listResponse.Contents || listResponse.Contents.length === 0) {
			return [];
		}

		const objectsToDelete = listResponse.Contents.map((object) => ({
			Key: object.Key!,
		}));

		await s3Client.send(
			new DeleteObjectsCommand({
				Bucket: env.AWS_S3_BUCKET_NAME,
				Delete: {
					Objects: objectsToDelete,
					Quiet: true,
				},
			})
		);

		return objectsToDelete.map((obj) => obj.Key);
	}

	async generatePresignedUrl(
		key: string,
		contentType: string
	): Promise<string> {
		const command = new PutObjectCommand({
			Bucket: env.AWS_S3_BUCKET_NAME,
			Key: key,
			ContentType: contentType,
		});
		return getSignedUrl(s3Client, command, { expiresIn: 3600 });
	}

	async uploadDirectoryToS3(localDir: string, s3Path: string) {
		const files = await fs.readdir(localDir);
		const uploadPromises = files.map(async (file) => {
			const localFilePath = path.join(localDir, file);
			const s3FilePath = `${s3Path}/${file}`;
			await this.uploadFileToS3(localFilePath, s3FilePath);
		});
		await Promise.all(uploadPromises);
	}

	async uploadFileToS3(localFilePath: string, s3Key: string) {
		const fileContent = await fs.readFile(localFilePath);

		const params: PutObjectCommandInput = {
			Bucket: this.BUCKET_NAME,
			Key: s3Key,
			Body: fileContent,
			// Add appropriate Content-Type for HLS files
			ContentType: this.getContentType(path.extname(s3Key)),
		};

		try {
			await s3Client.send(new PutObjectCommand(params));
			logger.info(`🟢 Uploaded ${s3Key} to s3://${this.BUCKET_NAME}/${s3Key}`);
		} catch (error) {
			logger.error(`🔴 Error uploading ${s3Key}:`, error);
			throw error;
		}
	}

	getContentType(extension: string): string {
		const typeMap: { [key: string]: string } = {
			".m3u8": "application/vnd.apple.mpegurl",
			".ts": "video/MP2T",
			".mp4": "video/mp4",
		};
		return typeMap[extension] || "application/octet-stream";
	}
}
