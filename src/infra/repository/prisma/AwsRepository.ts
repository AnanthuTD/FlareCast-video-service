import { IAwsRepository } from "@/app/repository/IAwsRepository";
import env from "@/infra/env";

import { CopyObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { Hash } from "@smithy/hash-node";
import { HttpRequest } from "@smithy/protocol-http";
import { parseUrl } from "@smithy/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";
import s3Client from "@/infra/s3";

export class AwsRepository implements IAwsRepository {
	createPresignedUrlWithoutClient = async ({ region, bucket, key }) => {
		const url = parseUrl(`https://${bucket}.s3.${region}.amazonaws.com/${key}`);
		const presigner = new S3RequestPresigner({
			region: env.AWS_REGION,
			sha256: Hash.bind(null, "sha256"),
			credentials: {
				accessKeyId: env.AWS_ACCESS_KEY_ID,
				secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
			},
		});

		const signedUrlObject = await presigner.presign(
			new HttpRequest({ ...url, method: "PUT" })
		);
		return formatUrl(signedUrlObject);
	};

	copyVideo = async (sourceVideoId: string, newVideoId: string) => {
		try {
			// List all objects in the source prefix (e.g., sourceVideoId/)
			const listResponse = await s3Client.send(
				new ListObjectsV2Command({
					Bucket: env.AWS_S3_BUCKET_NAME,
					Prefix: `${sourceVideoId}/`,
				})
			);

			if (!listResponse.Contents || listResponse.Contents.length === 0) {
				throw new Error(`No objects found in prefix ${sourceVideoId}/`);
			}

			// Copy each object to the new prefix (e.g., newVideoId/)
			for (const object of listResponse.Contents) {
				if (!object.Key) continue;

				const sourceKey = object.Key;
				const destinationKey = sourceKey.replace(
					`${sourceVideoId}/`,
					`${newVideoId}/`
				);

				await s3Client.send(
					new CopyObjectCommand({
						Bucket: env.AWS_S3_BUCKET_NAME,
						CopySource: `${env.AWS_S3_BUCKET_NAME}/${encodeURIComponent(
							sourceKey
						)}`,
						Key: destinationKey,
					})
				);
			}

			console.log(
				`Successfully copied folder ${sourceVideoId}/ to ${newVideoId}/`
			);
		} catch (error) {
			console.error(`Failed to copy folder: ${error.message}`);
			throw error;
		}
	};
}
