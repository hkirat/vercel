import { exec } from "child_process";
import path from "path";

export function buildProject(id: string) {
  return new Promise((resolve) => {
    // In Prod app we would run this securely
    // as user could have anything in build script
    // Also we could allow user to customise these commands
    const child = exec(
      `cd ${path.join(
        __dirname,
        `output/${id}`
      )} && npm install && npm run build`
    );

    // We can also show these logs to the user
    child.stdout?.on("data", function (data) {
      console.log("stdout: " + data);
    });
    child.stderr?.on("data", function (data) {
      console.log("stderr: " + data);
    });

    child.on("close", function (code) {
      resolve("");
    });
  });
}

// This function runs all many promises chunk wise so
// might not break our process
// Think of this function as glorified Promise.allSettled
export const chunkedPromiseAll = async <TItem, TReturn>(
  arr: TItem[],
  promiseFn: (item: TItem) => Promise<TReturn>,
  chunkSize = 10
) => {
  const values: PromiseSettledResult<TReturn>[] = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    values.push(
      ...(await Promise.allSettled(chunk.map((item) => promiseFn(item))))
    );
  }

  return values;
};
