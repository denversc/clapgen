import { logger } from "../lib/logging";
import { copyFileSync } from "node:fs";

async function main(): Promise<void> {
  for (const {srcPath, destPath} of filesToCopy()) {
    logger.info(`Copying ${srcPath} to ${destPath}`);
    copyFileSync(srcPath, destPath);
  }
}

interface FileCopySpec {
  srcPath: string,
  destPath: string,
}

function filesToCopy(): FileCopySpec[] {
  return [
    {srcPath: "dist/sdk.js", destPath: "../internal/config/sdk.js"},
    {srcPath: "dist/tscompiler.js", destPath: "../internal/tscompiler/tscompiler.js"},
  ]
}

main();
