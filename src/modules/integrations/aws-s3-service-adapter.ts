import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { config } from '../../app/config';

export const cloudflareR2ServiceAdapter = async (data: {
  file: PutObjectCommandInput['Body'];
  fileName: string;
  mimeType: string;
  folder: string;
}) => {
  const { file, fileName, mimeType, folder } = data;

  const cloudflareR2Client = new S3Client({
    region: config.implementations.cloudflareR2.region,
    endpoint: config.implementations.cloudflareR2.endpoint,
    credentials: {
      accessKeyId: config.implementations.cloudflareR2.accessKeyId,
      secretAccessKey: config.implementations.cloudflareR2.secretKey,
    },
  });

  const uniqueKey = `${folder}/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: config.implementations.cloudflareR2.bucket,
    Key: uniqueKey,
    Body: file,
    ACL: 'public-read',
    ContentType: mimeType,
    ContentDisposition: 'inline',
  });

  await cloudflareR2Client.send(command);
  const Location = `${config.implementations.cloudflareR2.urlRed}/${uniqueKey}`;
  return { Location };
};
