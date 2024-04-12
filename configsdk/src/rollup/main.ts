import rollup from "rollup";

import { cwd } from "node:process";

import { parseArgs } from "./args";
import { log } from "./util";
import { generate } from "./generate";
import * as sdk from "./sdk_options";
import * as tscompiler from "./tscompiler_options";

async function main(): Promise<void> {
  const parsedArgs = parseArgs();

  log(`Configuring rollup (rollup version: ${rollup.VERSION})`);
  log(`Current directory: ${cwd()}`);

  if (parsedArgs.sdkEnabled) {
    await generate(sdk);
  }

  if (parsedArgs.tscompilerEnabled) {
    await generate(tscompiler);
  }
}

main();
