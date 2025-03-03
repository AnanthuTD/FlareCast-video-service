import s3Client from "../s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
	getSignedUrl,
	S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";
import env from "../env";
import { Hash } from "@smithy/hash-node";
import { HttpRequest } from "@smithy/protocol-http";
import { parseUrl } from "@smithy/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";

export class AwsRepository {
	static createPresignedUrlWithoutClient = async ({ region, bucket, key }) => {
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
}
