import rollup from "rollup";

import { cwd } from "node:process";

import { parseArgs } from "./args";
import { MonotonicTimer } from "../lib/monotonic_timer";
import { getLogger } from "../lib/platform";
import { generate } from "./generate";
import * as sdk from "./sdk_options";
import * as tscompiler from "./tscompiler_options";
import { transpile } from "./transpile";
import { register as registerNodePlatform } from "../platform/node/node_platform";

async function main(): Promise<void> {
  registerNodePlatform();
  const logger = getLogger();
  const timer = new MonotonicTimer();
  const parsedArgs = parseArgs();

  logger.info(`Running Rollup (rollup version: ${rollup.VERSION})`);
  logger.info(`Current directory: ${cwd()}`);

  transpile();

  if (parsedArgs.sdkEnabled) {
    await generate(sdk);
  }

  if (parsedArgs.tscompilerEnabled) {
    await generate(tscompiler);
  }

  logger.complete(`Successfully built all requested outputs in ${timer.elapsed}`);
}

main();
