import rollup from "rollup";

import { cwd } from "node:process";

import { parseArgs } from "./args";
import { MonotonicTimer, logger } from "./util";
import { generate } from "./generate";
import * as sdk from "./sdk_options";
import * as tscompiler from "./tscompiler_options";

async function main(): Promise<void> {
  const timer = new MonotonicTimer();
  const parsedArgs = parseArgs();

  logger.info(`Configuring rollup (rollup version: ${rollup.VERSION})`);
  logger.info(`Current directory: ${cwd()}`);

  if (parsedArgs.sdkEnabled) {
    await generate(sdk);
  }

  if (parsedArgs.tscompilerEnabled) {
    await generate(tscompiler);
  }

  logger.complete(`Successfully built all outputs in ${timer.elapsed}`);
}

main();
