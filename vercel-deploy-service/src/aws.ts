import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";
import { chunkedPromiseAll } from "./utils";

const s3 = new S3({
  // Consider adding a check if these values are set or not.
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.CLOUDFLARE_STORAGE_ENDPOINT,
});

const BUCKET_NAME = "vercel";

// output/asdasd
export async function downloadS3Folder(prefix: string) {
  const allFiles = await s3
    .listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    })
    .promise();

  const filesList = allFiles.Contents;

  // TODO: handle error
  if (!filesList) {
    return;
  }

  await chunkedPromiseAll(filesList, async ({ Key }) => {
    if (!Key) {
      return;
    }

    const finalOutputPath = path.join(__dirname, Key);
    const outputFile = fs.createWriteStream(finalOutputPath);
    const dirName = path.dirname(finalOutputPath);

    if (!fs.existsSync(dirName)) {
      await fs.promises.mkdir(dirName, { recursive: true });
    }

    // Instead of reading the whole file, we again create a stream
    // and pipe to fs to create the file

    const s3Stream = s3
      .getObject({
        Bucket: BUCKET_NAME,
        Key,
      })
      .createReadStream();

    s3Stream.pipe(outputFile);

    await new Promise((resolve) => {
      s3Stream.on("finish", resolve);
    });
  });
}

export async function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const allFiles = await getAllFiles(folderPath);

  await chunkedPromiseAll(allFiles, (file) =>
    uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file)
  );
}

const getAllFiles = async (folderPath: string) => {
  const allFilesAndFolders = await fs.promises.readdir(folderPath);

  const allFilesPaths: string[] = [];

  // Also we are considering happy path some promises might fail
  // and break the app.
  await chunkedPromiseAll(allFilesAndFolders, async (fileOrFolderPath) => {
    const fullPath = path.join(folderPath, fileOrFolderPath);
    // Each content can be file or folder
    // check if folder, then we recusively call the function
    const isDir = (await fs.promises.stat(fullPath)).isDirectory();

    if (isDir) {
      const filesInsideDir = await getAllFiles(fullPath);
      allFilesPaths.concat(filesInsideDir);
    } else {
      allFilesPaths.push(fullPath);
    }
  });

  return allFilesPaths;
};

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
