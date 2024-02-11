import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { chunkedPromiseAll, generateRandomID } from "./utils";
import { getAllFiles } from "./file";
import path from "path";
import { uploadFile } from "./aws";
import { createClient } from "redis";
import "dotenv/config";

const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

const OUTPUT_FOLDER = "/output";

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;

  if (
    !repoUrl ||
    typeof repoUrl !== "string" ||
    !repoUrl.startsWith("https://github.com") // Only checking github.com, prod app would support multiple clients
  ) {
    res.statusCode = 400;

    return res.json({
      error: "INVALID_REPO_URL",
    });
  }

  // get random id for each project
  const id = generateRandomID();

  const repoPath = path.join(__dirname, `${OUTPUT_FOLDER}/${id}`);

  // Clone repo in our output folder
  await simpleGit().clone(repoUrl, repoPath);

  const files = await getAllFiles(repoPath);

  await chunkedPromiseAll(files, (file) => {
    return uploadFile(file.slice(__dirname.length + 1), file);
  });

  publisher.lPush("build-queue", id);
  // INSERT => SQL
  // .create =>
  publisher.hSet("status", id, "uploaded");

  res.json({
    id: id,
  });
});

app.get("/status", async (req, res) => {
  const id = req.query.id;
  const response = await subscriber.hGet("status", id as string);
  res.json({
    status: response,
  });
});

app.listen(3000);
