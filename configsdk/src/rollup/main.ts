import rollup from "rollup";

import { cwd } from "node:process";
import { log } from "./log";
import { generate } from "./generate";
import * as sdk from "./sdk_options";
import * as tscompiler from "./tscompiler_options";

async function main(): Promise<void> {
  log(`Configuring rollup (rollup version: ${rollup.VERSION})`);
  log(`Current directory: ${cwd()}`);
  await generate(sdk);
  await generate(tscompiler);
}

main();
