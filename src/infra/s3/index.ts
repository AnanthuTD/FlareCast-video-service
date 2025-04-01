import { S3Client } from '@aws-sdk/client-s3';
import env from '../env';

const s3Client = new S3Client({
  region: env.AWS_REGION || 'us-east-1',
});

export default s3Client;