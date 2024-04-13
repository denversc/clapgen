import { getLogger } from "../lib/platform";
import { copyFileSync } from "node:fs";
import { register as registerNodePlatform } from "../platform/node/node_platform";

async function main(): Promise<void> {
  registerNodePlatform();

  const logger = getLogger();
  for (const { srcPath, destPath } of filesToCopy()) {
    logger.info(`Copying ${srcPath} to ${destPath}`);
    copyFileSync(srcPath, destPath);
  }
}

interface FileCopySpec {
  srcPath: string;
  destPath: string;
}

function filesToCopy(): FileCopySpec[] {
  return [
    { srcPath: "dist/sdk.js", destPath: "../internal/config/sdk.js" },
    { srcPath: "dist/tscompiler.js", destPath: "../internal/tscompiler/tscompiler.js" }
  ];
}

main();
