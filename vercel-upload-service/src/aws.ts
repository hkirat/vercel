import { S3 } from "aws-sdk";
import fs from "fs";
require("dotenv").config()

const {AWS_ACCESS_KEY,AWS_SECRET_ACCESS_KEY,CLOUDFLARE_STORAGE_ENDPOINT,PORT} = process.env

const s3 = new S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    endpoint: CLOUDFLARE_STORAGE_ENDPOINT
})

// fileName => output/12312/src/App.jsx
// filePath => /Users/harkiratsingh/vercel/dist/output/12312/src/App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response);
}