import { createClient, commandOptions } from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";
const subscriber = createClient();
subscriber.connect();

const publisher = createClient();
publisher.connect();

async function main() {
  while (1) {
    const res = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );

    if (!res) {
      // if we don't get the response correct, something is wrong
      // TODO: handle errors
      continue;
    }

    const projectId = res.element;

    await downloadS3Folder(`output/${projectId}`);
    await buildProject(projectId);
    copyFinalDist(projectId);
    publisher.hSet("status", projectId, "deployed");
  }
}
main();
