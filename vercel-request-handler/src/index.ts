import express from "express";
import { S3 } from "aws-sdk";
require("dotenv").config()

const {AWS_ACCESS_KEY,AWS_SECRET_ACCESS_KEY,CLOUDFLARE_STORAGE_ENDPOINT,PORT} = process.env

const s3 = new S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    endpoint: CLOUDFLARE_STORAGE_ENDPOINT
})

const app = express();

app.get("/*", async (req, res) => {
    // id.100xdevs.com
    const host = req.hostname;

    const id = host.split(".")[0];
    const filePath = req.path;

    const contents = await s3.getObject({
        Bucket: "vercel",
        Key: `dist/${id}${filePath}`
    }).promise();
    
    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
    res.set("Content-Type", type);

    res.send(contents.Body);
})

app.listen(PORT, () => {
    console.log(`Server listening on PORT : ${PORT}`);
  });