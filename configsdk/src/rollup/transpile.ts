import * as ts from "typescript";

import { logger, MonotonicTimer } from "./util";
import type { ParsedCommandLine, FormatDiagnosticsHost, CreateProgramOptions } from "typescript";

export function transpile(): void {
  logger.info("TypeScript compilation starting");
  const timer = new MonotonicTimer();

  const formatDiagnosticsHost = new MyFormatDiagnosticsHost();
  const tsConfig = loadTsConfig(formatDiagnosticsHost);

  logger.info(`Compiling ${tsConfig.fileNames.length} TypeScript files`);
  const compilerHost = ts.createCompilerHost(tsConfig.options);

  const programOptions: CreateProgramOptions = {
    rootNames: tsConfig.fileNames,
    options: tsConfig.options,
    host: compilerHost
  };
  if (tsConfig.projectReferences) {
    programOptions.projectReferences = tsConfig.projectReferences;
  }
  const program = ts.createProgram(programOptions);

  const preEmitDiagnostics = ts.getPreEmitDiagnostics(program);
  if (preEmitDiagnostics.length > 0) {
    logger.error(ts.formatDiagnosticsWithColorAndContext(preEmitDiagnostics, compilerHost));
    throw new TsCompileError("TypeScript compilation failed pre-emit");
  }

  const emitResult = program.emit();

  if (emitResult.diagnostics.length > 0) {
    logger.error(ts.formatDiagnosticsWithColorAndContext(emitResult.diagnostics, compilerHost));
    throw new TsCompileError("TypeScript compilation failed during emit");
  }

  logger.complete(`TypeScript compilation completed in ${timer.elapsed}`);
}

function loadTsConfig(host: FormatDiagnosticsHost): ParsedCommandLine {
  const tsConfigFilePath = "tsconfig.rollup.json";
  logger.info(`Loading ${tsConfigFilePath}`);

  const result = ts.readConfigFile(tsConfigFilePath, ts.sys.readFile);
  if (result.error) {
    const diagnosticStr = ts.formatDiagnosticsWithColorAndContext([result.error], host);
    throw new TsConfigLoadError(`Loading ${tsConfigFilePath} FAILED: ${diagnosticStr}`);
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    result.config,
    ts.sys,
    ".",
    undefined,
    tsConfigFilePath
  );
  if (parsedConfig.errors && parsedConfig.errors.length > 0) {
    const diagnosticStr = ts.formatDiagnosticsWithColorAndContext(parsedConfig.errors, host);
    throw new TsConfigLoadError(`Loading ${tsConfigFilePath} FAILED: ${diagnosticStr}`);
  }

  return parsedConfig;
}

class MyFormatDiagnosticsHost implements FormatDiagnosticsHost {
  getCanonicalFileName(fileName: string): string {
    return fileName;
  }

  getCurrentDirectory(): string {
    return ts.sys.getCurrentDirectory();
  }

  getNewLine(): string {
    return ts.sys.newLine;
  }
}

export class TsConfigLoadError extends Error {
  override readonly name: "TsConfigLoadError" = "TsConfigLoadError";
}

export class NoTsSourcesFoundError extends Error {
  override readonly name: "NoTsSourcesFoundError" = "NoTsSourcesFoundError";
}

export class TsCompileError extends Error {
  override readonly name: "TsCompileError" = "TsCompileError";
}
