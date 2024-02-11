import fs from "fs/promises";
import path from "path";
import { chunkedPromiseAll } from "./utils";

export const getAllFiles = async (folderPath: string) => {
  const allFilesAndFolders = await fs.readdir(folderPath);

  const allFilesPaths: string[] = [];

  // Also we are considering happy path some promises might fail
  // and break the app.
  await chunkedPromiseAll(allFilesAndFolders, async (fileOrFolderPath) => {
    const fullPath = path.join(folderPath, fileOrFolderPath);
    // Each content can be file or folder
    // check if folder, then we recusively call the function
    const isDir = (await fs.stat(fullPath)).isDirectory();

    if (isDir) {
      const filesInsideDir = await getAllFiles(fullPath);
      allFilesPaths.concat(filesInsideDir);
    } else {
      allFilesPaths.push(fullPath);
    }
  });

  return allFilesPaths;
};
