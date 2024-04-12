import { argv } from "node:process";

export interface ParsedArgs {
  sdkEnabled: boolean;
  tscompilerEnabled: boolean;
}

export function parseArgs(): ParsedArgs {
  let sdkEnabled = true;
  let tscompilerEnabled = true;
  let first = true;

  for (const arg of argv.slice(2)) {
    if (first) {
      sdkEnabled = false;
      tscompilerEnabled = false;
      first = false;
    }
    if (arg === "sdk") {
      sdkEnabled = true;
    } else if (arg === "tscompiler") {
      tscompilerEnabled = true;
    } else {
      throw new ParseArgsError(`unknown command-line argument: ${arg}`);
    }
  }

  return { sdkEnabled, tscompilerEnabled };
}

export class ParseArgsError extends Error {
  override readonly name: "ParseArgsError" = "ParseArgsError";
}
