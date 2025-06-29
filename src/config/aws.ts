import { readFile } from "node:fs/promises";
import {
  PutObjectCommand,
  S3Client,
  S3ServiceException,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'streaming-video-bucket';

export const uploadToS3 = async (filePath: string, key: string, contentType?: string) => {
  const fileBuffer = await readFile(filePath);
  
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    }
  });

  try {
    const result = await upload.done();
    return result;
  } catch (error) {
    if (error instanceof S3ServiceException) {
      console.error(`S3 Error: ${error.name}: ${error.message}`);
    }
    throw error;
  }
};

export const getSignedStreamUrl = async (key: string, expiresIn: number = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

export const deleteFromS3 = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  try {
    const result = await s3Client.send(command);
    return result;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

export const getFileMetadata = async (key: string) => {
  const command = new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  try {
    const result = await s3Client.send(command);
    return result;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};

export const getPublicUrl = (key: string) => {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
};

export { s3Client, BUCKET_NAME };
