import express from "express";
import { S3 } from "aws-sdk";
import "dotenv/config";
import mime from "mime-types";

const s3 = new S3({
  // Consider adding a check if these values are set or not.
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.CLOUDFLARE_STORAGE_ENDPOINT,
});

const BUCKET_NAME = "vercel";

const app = express();

app.get("/*", async (req, res) => {
  // id.100xdevs.com
  const host = req.hostname;

  // Ideally we would also check if id is correct or not
  const id = host.split(".")[0];
  // Also sanitize this path for ./../../ attacks etc
  const filePath = req.path;

  const contentType = mime.contentType(filePath);

  if (contentType) {
    res.setHeader("content-type", contentType);
  }

  // Ideally we would also check if the path exists or not
  // We create a readSteam to not load the complete file in memory
  // As we read some data from AWS, we send that data to user.
  const stream = s3
    .getObject({
      Bucket: BUCKET_NAME,
      Key: `dist/${id}${filePath}`,
    })
    .createReadStream();

  stream.pipe(res);
});

app.listen(3001);
