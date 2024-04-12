import type { InputOptions, OutputOptions } from "rollup";

import rollup from "rollup";

import { formatElapsedTime, log } from "./util";

export interface GenerateOptions {
  inputOptions(): InputOptions;
  outputOptions(): OutputOptions;
}

export async function generate(options: GenerateOptions): Promise<void> {
  const inputOptions = options.inputOptions();
  const outputOptions = options.outputOptions();

  const startTime = performance.now();
  log(`Generating ${outputOptions.file} from ${inputOptions.input}`);

  log(`Loading ${inputOptions.input}`);
  const bundle = await rollup.rollup(inputOptions);

  log(`Generating ${outputOptions.file}`);
  const output = await bundle.write(outputOptions);

  const endTime = performance.now();
  const elapsedTime = formatElapsedTime(startTime, endTime);
  const outputFileNames = output.output.map((entry) => entry.fileName);
  log(`Generated ${outputFileNames.length} files in ${elapsedTime}: ${outputFileNames.join(", ")}`);
}
