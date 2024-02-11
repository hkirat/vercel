import express from "express";
import { S3 } from "aws-sdk";

const s3 = new S3({
    accessKeyId: "7ea9c3f8c7f0f26f0d21c5ce99d1ad6a",
    secretAccessKey: "b4df203781dd711223ce931a2d7ca269cdbf81bb530de4548474584951b798be",
    endpoint: "https://e21220f4758c0870ba9c388712d42ef2.r2.cloudflarestorage.com"
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
    
    const ext = filePath.split(".").pop();
    let type: string;
    switch (ext) {
      case "html":
        type = "text/html";
        break;
      case "css":
        type = "text/css";
        break;
      case "js":
        type = "text/javascript";
        break;
      case "json":
        type = "application/json";
        break;
      case "png":
        type = "image/png";
        break;
      case "jpg":
        type = "image/jpg";
        break;
      case "jpeg":
        type = "image/jpeg";
        break;
      case "svg":
        type = "image/svg+xml";
        break;
      case "gif":
        type = "image/gif";
        break;
      case "ico":
        type = "image/x-icon";
        break;
      default:
        type = "text/plain";
    }
    res.set("Content-Type", type);

    res.send(contents.Body);
})

app.listen(3001);
