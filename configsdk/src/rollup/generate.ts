import type { InputOptions, OutputAsset, OutputChunk, OutputOptions, RollupOutput } from "rollup";

import { statSync } from "node:fs";
import { join } from "node:path";
import rollup from "rollup";

import { MonotonicTimer } from "../lib/monotonic_timer";
import { getLogger } from "../lib/platform";

export interface GenerateOptions {
  inputOptions(): InputOptions;
  outputOptions(): OutputOptions;
}

export async function generate(options: GenerateOptions): Promise<void> {
  const logger = getLogger();
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

  logOutput(output, timer.elapsed);
}

function logOutput(output: RollupOutput, elapsedTime: string): void {
  const logger = getLogger();
  if (output.output.length === 0) {
    logger.success(`Generated 0 files in ${elapsedTime}`);
  } else if (output.output.length === 1) {
    logger.success(`Generated 1 file in ${elapsedTime}:`);
  } else {
    logger.success(`Generated ${output.output.length} files in ${elapsedTime}:`);
  }

  for (const chunk of output.output) {
    logger.note("  Generated file: " + formatChunk(chunk));
  }
}

function formatChunk(chunk: OutputChunk | OutputAsset): string {
  const fileName = chunk.fileName;
  const filePath = join("dist", fileName);
  const statResult = statSync(filePath, { bigint: true, throwIfNoEntry: false });
  const formattedFileSize = statResult?.size.toLocaleString("en-US");
  const fileSizeStr = formattedFileSize !== undefined ? formattedFileSize + " bytes" : "unknown";
  return `${filePath} (size: ${fileSizeStr})`;
}
