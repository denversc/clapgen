import type { InputOptions, OutputOptions } from "rollup";

import rollup from "rollup";

import { MonotonicTimer, logger } from "./util";

export interface GenerateOptions {
  inputOptions(): InputOptions;
  outputOptions(): OutputOptions;
}

export async function generate(options: GenerateOptions): Promise<void> {
  const inputOptions = options.inputOptions();
  const outputOptions = options.outputOptions();

  const timer = new MonotonicTimer();
  logger.start(`Generating ${outputOptions.file} from ${inputOptions.input}`);

  logger.await(`Loading ${inputOptions.input}`);
  const loadingTimer = new MonotonicTimer();
  const bundle = await rollup.rollup(inputOptions);
  logger.note(`Loading ${inputOptions.input} completed in ${loadingTimer.elapsed}`);

  logger.await(`Generating ${outputOptions.file}`);
  const generatingTimer = new MonotonicTimer();
  const output = await bundle.write(outputOptions);
  logger.note(`Generating ${outputOptions.file} completed in ${generatingTimer.elapsed}`);

  const outputFileNames = output.output.map((entry) => entry.fileName);
  logger.success(
    `Generated ${outputFileNames.length} files ` +
      `in ${timer.elapsed}: ${outputFileNames.join(", ")}`
  );
}
