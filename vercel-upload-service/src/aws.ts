import { S3 } from "aws-sdk";
import fs from "fs";

const s3 = new S3({
  // Consider adding a check if these values are set or not.
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.CLOUDFLARE_STORAGE_ENDPOINT,
});

const BUCKET_NAME = "vercel";

// fileName => output/12312/src/App.jsx
// filePath => /Users/harkiratsingh/vercel/dist/output/12312/src/App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
  // Create a read stream so we don't load the complete file in memory
  const fileStream = fs.createReadStream(localFilePath);
  const response = await s3
    .upload({
      Body: fileStream,
      Bucket: BUCKET_NAME,
      Key: fileName,
    })
    .promise();

  console.log(response);
};
